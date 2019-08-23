
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { OAuth } from 'oauth';
import * as querystring from 'querystring';
import * as URL from 'url';
import { AttachmentsResponse } from '../AccountingAPI-responses';
import { XeroError } from '../XeroError';
import { IHttpClient } from './BaseAPIClient';

export interface RequestToken {
	oauth_token: string;
	oauth_token_secret: string;
}

export interface AccessToken extends RequestToken {
	oauth_session_handle?: string;
	oauth_expires_at?: Date;
}

/** @private */
export interface OAuth1Configuration {
	consumerKey: string;
	consumerSecret: string;
	tenantType: string;

	apiBaseUrl: string;
	apiBasePath: string;
	oauthRequestTokenPath: string;
	oauthAccessTokenPath: string;

	signatureMethod: string;
	accept: string;
	userAgent: string;
	callbackUrl: string;
}

/** @private */
export interface IOAuth1Client {
	agent?: http.Agent;
	getRequestToken(): Promise<RequestToken>;
	buildAuthoriseUrl(requestToken: RequestToken): string;
	swapRequestTokenforAccessToken(requestToken: RequestToken, oauth_verifier: string): Promise<AccessToken>;
	refreshAccessToken(): Promise<AccessToken>;
}

/** @private */
export interface IOAuth1HttpClient extends IHttpClient, IOAuth1Client { }

/** @private */
export class OAuth1HttpClient implements IOAuth1HttpClient {

	private _state: AccessToken = null;

	private oauthLib: typeof OAuth;

	public agent: http.Agent = null;

	private _defaultHeaders = {
		'Accept': 'application/json',
		'User-Agent': this.config.userAgent
	};

	private resetToDefaultHeaders() {
		this.oauthLib._headers = this._defaultHeaders;
	}

	constructor(private config: OAuth1Configuration, authState?: AccessToken, private oAuthLibFactory?: (config: OAuth1Configuration) => typeof OAuth) {
		if (authState) {
			this._state = authState;
		}

		if (!this.oAuthLibFactory) {
			this.oAuthLibFactory = function(passedInConfig: OAuth1Configuration) {
				let requestTokenPath = passedInConfig.oauthRequestTokenPath;
				if (passedInConfig.tenantType) {
					requestTokenPath += `?tenantType=${passedInConfig.tenantType}`;
				}
				return new OAuth(
					passedInConfig.apiBaseUrl + requestTokenPath, 	// requestTokenUrl
					passedInConfig.apiBaseUrl + passedInConfig.oauthAccessTokenPath, 	// accessTokenUrl
					passedInConfig.consumerKey, 										// consumerKey
					passedInConfig.consumerSecret,										// consumerSecret
					'1.0A',																// version
					config.callbackUrl,													// authorize_callback
					passedInConfig.signatureMethod,										// signatureMethod. Neesds to ve "RSA-SHA1" for Private. "HMAC-SHA1" for public
					null,																// nonceSize
					{																	// customHeaders
						'Accept': passedInConfig.accept,
						'User-Agent': passedInConfig.userAgent
					}
				);
			};
		}

		this.oauthLib = this.oAuthLibFactory(this.config);
		this.oauthLib._createClient = this._createHttpClientWithProxySupport.bind(this);
	}

	public getRequestToken = async () => {
		this.resetToDefaultHeaders();
		return new Promise<RequestToken>((resolve, reject) => {
			this.oauthLib.getOAuthRequestToken(
				(err: any, oauth_token: string, oauth_token_secret: string, result: any) => {
					if (err) {
						reject(err.statusCode ? new XeroError(err.statusCode, err.data, null) : err);
					} else {
						resolve({
							oauth_token,
							oauth_token_secret
						});
					}
				}
			);
		});
	}

	public buildAuthoriseUrl = (requestToken: RequestToken) => {
		return `${this.config.apiBaseUrl}/oauth/Authorize?oauth_token=${requestToken.oauth_token}`;
	}

	public swapRequestTokenforAccessToken = async (requestToken: RequestToken, oauth_verifier: string) => {
		this.resetToDefaultHeaders();
		return new Promise<AccessToken>((resolve, reject) => {
			this.oauthLib.getOAuthAccessToken(
				requestToken.oauth_token,
				requestToken.oauth_token_secret,
				oauth_verifier,
				(err: any, oauth_token: string, oauth_token_secret: string, results: { oauth_expires_in: number, oauth_session_handle: string, oauth_authorization_expires_in: string, xero_org_muid: string }) => {
					if (err) {
						reject(err.statusCode ? new XeroError(err.statusCode, err.data, null) : err);
					} else {
						const currentMilliseconds = new Date().getTime();
						const expDate = new Date(currentMilliseconds + (results.oauth_expires_in * 1000));
						const oauthState: AccessToken = {
							oauth_token: oauth_token,
							oauth_token_secret: oauth_token_secret,
							oauth_session_handle: results.oauth_session_handle,
							oauth_expires_at: expDate
						};
						this.setState(oauthState);
						resolve(oauthState);
					}
				}
			);
		});

	}

	public refreshAccessToken = async () => {
		return new Promise<AccessToken>((resolve, reject) => {
			// We're accessing this "private" method as the lib does not allow refresh with oauth_session_handle.
			this.oauthLib._performSecureRequest(
				this._state.oauth_token,
				this._state.oauth_token_secret,
				'POST',
				this.config.apiBaseUrl + this.config.oauthAccessTokenPath,
				{ oauth_session_handle: this._state.oauth_session_handle },
				null,
				null,
				(err: any, data: string, response: any) => {
					if (err) {
						reject(err.statusCode ? new XeroError(err.statusCode, err.data, response ? response.headers : null) : err);
					} else {
						const results = querystring.parse(data) as any;
						const currentMilliseconds = new Date().getTime();
						const expDate = new Date(currentMilliseconds + (results.oauth_expires_in * 1000));

						const oauthState: AccessToken = {
							oauth_token: results.oauth_token,
							oauth_token_secret: results.oauth_token_secret,
							oauth_session_handle: results.oauth_session_handle,
							oauth_expires_at: expDate
						};
						this.setState(oauthState);
						resolve(oauthState);
					}
				}
			);
		});
	}

	public writeUTF8ResponseToStream = (endpoint: string, mimeType: string, writeStream: fs.WriteStream): Promise<void> => {
		this.resetToDefaultHeaders();
		return new Promise<void>((resolve, reject) => {
			this.assertAccessTokenIsSet();
			const oauthForPdf = this.oAuthLibFactory({ ...this.config, ...{ accept: mimeType } });
			const request = oauthForPdf.get(
				this.config.apiBaseUrl + this.config.apiBasePath + endpoint,
				this._state.oauth_token,
				this._state.oauth_token_secret);

			request.addListener('response', function(response: any) {
				response.on('data', function(chunk: any) {
					writeStream.write(chunk);
				});
				response.on('end', function() {
					writeStream.end();
					return resolve();
				});
				response.on('close', function() {
					writeStream.end();
					return resolve();
				});
			});
			request.end();
		});
	}

	public writeBinaryResponseToStream = (endpoint: string, mimeType: string, writeStream: fs.WriteStream): Promise<void> => {
		this.resetToDefaultHeaders();
		return new Promise<void>((resolve, reject) => {
			this.assertAccessTokenIsSet();
			const forPDF = this.oAuthLibFactory({ ...this.config, ...{ accept: mimeType } });
			this._OURperformSecureRequest(
				this._state.oauth_token,
				this._state.oauth_token_secret,
				'GET',
				this.config.apiBaseUrl + this.config.apiBasePath + endpoint,
				(err: any, data: string, httpResponse: any) => {
					// data is the body of the response

					if (err) {
						reject(err.statusCode ? new XeroError(err.statusCode, err.data, httpResponse.headers) : err);
					} else {
						const buffer = Buffer.from(data, 'binary');

						writeStream.write(buffer, () => {
							writeStream.close();
							return resolve();
						});
					}
				}, forPDF);
		});
	}

	private _OURperformSecureRequest = function(oauth_token: any, oauth_token_secret: any, method: any, url: any, callback: any, oauthForBinary: any) {
		// This code was copied out from the lib as it does not support binary downloads.

		const orderedParameters: any = oauthForBinary._prepareParameters(oauth_token, oauth_token_secret, method, url, null);

		const parsedUrl = URL.parse(url, false);
		if (parsedUrl.protocol == 'http:' && !parsedUrl.port) { parsedUrl.port = '80'; }
		if (parsedUrl.protocol == 'https:' && !parsedUrl.port) { parsedUrl.port = '443'; }

		const headers: any = {};
		const authorization = oauthForBinary._buildAuthorizationHeaders(orderedParameters);
		headers['Authorization'] = authorization;

		headers['Host'] = parsedUrl.host;

		for (const key in this._headers) {
			if (this._headers.hasOwnProperty(key)) {
				headers[key] = this._headers[key];
			}
		}

		headers['Content-length'] = 0;

		let path;
		if (!parsedUrl.pathname || parsedUrl.pathname == '') { parsedUrl.pathname = '/'; }
		// tslint:disable-next-line:prefer-conditional-expression
		if (parsedUrl.query) { path = parsedUrl.pathname + '?' + parsedUrl.query; }
		else { path = parsedUrl.pathname; }

		let request;
		// tslint:disable-next-line:prefer-conditional-expression
		if (parsedUrl.protocol == 'https:') {
			request = oauthForBinary._createClient(parsedUrl.port, parsedUrl.hostname, method, path, headers, true);
		}
		else {
			request = oauthForBinary._createClient(parsedUrl.port, parsedUrl.hostname, method, path, headers);
		}

		let data = '';

		function passBackControl(response: any) {
			if (response.statusCode >= 200 && response.statusCode <= 299) {
				callback(null, data, response);
			} else {
				callback({ statusCode: response.statusCode, data: data }, data, response);
			}
		}

		request.on('response', function(response: any) {
			response.setEncoding('binary');
			response.on('data', function(chunk: any) {
				data += chunk;
			});
			response.on('end', function() {
				passBackControl(response);
			});
			// response.on('close', function() {
			//     passBackControl(response);
			// });
		});

		request.on('error', function(err: Error) {
			callback(err);
		});

		request.end();
	};

	public readStreamToRequest = (endpoint: string, mimeType: string, size: number, readStream: fs.ReadStream): Promise<AttachmentsResponse> => {
		this.resetToDefaultHeaders();
		return new Promise<AttachmentsResponse>((resolve, reject) => {
			this.assertAccessTokenIsSet();

			this.resetToDefaultHeaders();

			const bufs: any = [];

			readStream
				.on('data', (chunk) => {
					bufs.push(chunk);
				})
				.on('end', () => {
					this.oauthLib._headers = {
						...this._defaultHeaders, ...{ 'Content-Type': mimeType, 'Content-Length': size }
					};

					this.oauthLib.post(
						this.config.apiBaseUrl + this.config.apiBasePath + endpoint, // url
						this._state.oauth_token,
						this._state.oauth_token_secret,
						Buffer.concat(bufs),
						mimeType,
						(err: any, data: string, httpResponse: any) => {
							if (err) {
								reject(new XeroError(httpResponse.statusCode, data, httpResponse ? httpResponse.headers : null));
							} else {
								const toReturn = JSON.parse(data) as AttachmentsResponse;
								return resolve(toReturn);
							}
						}
					);
				});
		});
	}

	public get = async <T>(endpoint: string, customHeaders?: { [key: string]: string }): Promise<T> => {
		this.resetToDefaultHeaders();
		this.oauthLib._headers = { ...this._defaultHeaders, ...customHeaders };
		return new Promise<T>((resolve, reject) => {
			this.assertAccessTokenIsSet();
			this.oauthLib.get(
				this.config.apiBaseUrl + this.config.apiBasePath + endpoint, // url
				this._state.oauth_token,
				this._state.oauth_token_secret,
				(err: any, data: string, httpResponse: any) => {
					// data is the body of the response

					if (err) {
						reject(err.statusCode ? new XeroError(err.statusCode, err.data, httpResponse ? httpResponse.headers : null) : err);
					} else {
						const toReturn = JSON.parse(data) as T;
						return resolve(toReturn);
					}
				}
			);
		});
	}

	public put = async <T>(endpoint: string, body: object, customHeaders?: { [key: string]: string }): Promise<T> => {
		this.resetToDefaultHeaders();
		this.oauthLib._headers = { ...this._defaultHeaders, ...customHeaders };
		this.assertAccessTokenIsSet();
		return new Promise<T>((resolve, reject) => {
			this.oauthLib.put(
				this.config.apiBaseUrl + this.config.apiBasePath + endpoint, // url
				this._state.oauth_token,
				this._state.oauth_token_secret,
				JSON.stringify(body), 		// Had to do this not sure if there is another way
				'application/json',
				(err: any, data: string, httpResponse: any) => {
					// data is the body of the response

					if (err) {
						reject(err.statusCode ? new XeroError(err.statusCode, err.data, httpResponse ? httpResponse.headers : null) : err);
					} else {
						const toReturn = JSON.parse(data) as T;
						return resolve(toReturn);
					}
				}
			);

		});
	}

	public post = async <T>(endpoint: string, body: object, customHeaders?: { [key: string]: string }): Promise<T> => {
		this.resetToDefaultHeaders();
		this.oauthLib._headers = { ...this._defaultHeaders, ...customHeaders };
		this.assertAccessTokenIsSet();
		return new Promise<T>((resolve, reject) => {
			this.oauthLib.post(
				this.config.apiBaseUrl + this.config.apiBasePath + endpoint, // url
				this._state.oauth_token,
				this._state.oauth_token_secret,
				JSON.stringify(body), 		// Had to do this not sure if there is another way
				'application/json',
				(err: any, data: string, httpResponse: any) => {
					// data is the body of the response

					if (err) {
						reject(err.statusCode ? new XeroError(err.statusCode, err.data, httpResponse ? httpResponse.headers : null) : err);
					} else {
						let toReturn: T = null;
						if (data) {
							toReturn = JSON.parse(data) as T;
						}
						return resolve(toReturn);
					}
				}
			);

		});
	}

	public patch = async <T>(endpoint: string, body: object, customHeaders?: { [key: string]: string }): Promise<T> => {
		this.resetToDefaultHeaders();
		this.oauthLib._headers = { ...this._defaultHeaders, ...customHeaders };
		this.assertAccessTokenIsSet();
		return new Promise<T>((resolve, reject) => {
			this.oauthLib.patch(
				this.config.apiBaseUrl + this.config.apiBasePath + endpoint, // url
				this._state.oauth_token,
				this._state.oauth_token_secret,
				JSON.stringify(body), 		// Had to do this not sure if there is another way
				'application/json',
				(err: any, data: string, httpResponse: any) => {
					// data is the body of the response

					if (err) {
						reject(err.statusCode ? new XeroError(err.statusCode, err.data, httpResponse ? httpResponse.headers : null) : err);
					} else {
						const toReturn = JSON.parse(data) as T;
						return resolve(toReturn);
					}
				}
			);

		});
	}

	public delete = async <T>(endpoint: string, customHeaders?: { [key: string]: string }): Promise<T> => {
		this.resetToDefaultHeaders();
		this.oauthLib._headers = { ...this._defaultHeaders, ...customHeaders };
		this.assertAccessTokenIsSet();
		return new Promise<T>((resolve, reject) => {
			this.oauthLib.delete(
				this.config.apiBaseUrl + this.config.apiBasePath + endpoint, // url
				this._state.oauth_token,
				this._state.oauth_token_secret,
				(err: any, data: string, httpResponse: any) => {
					// data is the body of the response

					if (err) {
						reject(err.statusCode ? new XeroError(err.statusCode, err.data, httpResponse ? httpResponse.headers : null) : err);
					} else {
						let toReturn: T = null;
						if (data) {
							toReturn = JSON.parse(data) as T;
						}
						return resolve(toReturn);
					}
				}
			);
		});
	}

	private setState(newState: Partial<AccessToken>) {
		this._state = { ...this._state, ...newState };
	}

	private assertAccessTokenIsSet() {
		if (!this._state.oauth_token) {
			throw new Error('Missing access token. Acquire a new access token by following the oauth flow or call setState() to use an existing token.');
		}
	}

	// Monkey-patched OAuthLib _createClient function to add proxy support
	private _createHttpClientWithProxySupport(
		port: number,
		hostname: string,
		method: string,
		path: string,
		headers: any,
		sslEnabled?: boolean) {
		const options: http.RequestOptions = {
			host: hostname,
			port: port,
			path: path,
			method: method,
			headers: headers
		};
		const httpModel: any = sslEnabled ? https : http;
		if (this.agent) {
			options.agent = this.agent;
		}
		return httpModel.request(options);
	}
}
