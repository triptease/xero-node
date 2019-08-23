import { CurrenciesResponse } from '../AccountingAPI-responses';
import { AccountingAPIClient } from '../AccountingAPIClient';
import { getPrivateConfig, setJestTimeout } from './helpers/integration.helpers';

describe('/currencies', () => {
	let xero: AccountingAPIClient;

	beforeAll(async () => {
		setJestTimeout();
		const config = getPrivateConfig('1');
		xero = new AccountingAPIClient(config);
	});

	it('create', async () => {
		expect.assertions(1);

		let response: CurrenciesResponse;
		try {
			response = await xero.currencies.create({ Code: 'PHP' });
			expect(response.Currencies).toContainEqual({
				Code: 'PHP',
				Description: 'Philippine Peso'
			});
		} catch (err) {
			// you can't re-subscribe to a currency you're already subscribed to
			expect(err.statusCode).toBe(400);
			return;
		}
	});

	it('get all', async () => {
		const response = await xero.currencies.get();
		expect(response).toBeTruthy();
		expect(response.Currencies).toContainEqual({
			Code: 'PHP',
			Description: 'Philippine Peso'
		});
	});
});
