import { InvoicesResponse } from '../../AccountingAPI-responses';

export const multipleInvoices: InvoicesResponse = {
	Id: '431b0b6a-81bf-4286-82f3-73e6f8c78fd3',
	Status: 'OK',
	ProviderName: 'Xero API Previewer',
	DateTimeUTC: '\/Date(1518298927172)\/',
	Invoices: [
		{
			Type: 'ACCPAY',
			InvoiceID: '0032f627-3156-4d30-9b1c-4d3b994dc921',
			InvoiceNumber: '9871',
			Reference: '',
			Payments: [
				{
					PaymentID: '22974891-3689-4694-9ee7-fd2ba917af55',
					Date: '\/Date(1508889600000+0000)\/',
					Amount: 148.50,
					Reference: 'Chq 409',
					HasAccount: false
				}
			],
			CreditNotes: [],
			Prepayments: [],
			Overpayments: [],
			AmountDue: 0.00,
			AmountPaid: 148.50,
			AmountCredited: 0.00,
			HasErrors: false,
			IsDiscounted: false,
			HasAttachments: true,
			Contact: {
				ContactID: 'd6a384fb-f46f-41a3-8ac7-b7bc9e0b5efa',
				Name: 'Melrose Parking',
				Addresses: [],
				Phones: [],
				ContactGroups: [],
				ContactPersons: []
			},
			DateString: '2017-10-17T00:00:00',
			Date: '\/Date(1508198400000+0000)\/',
			DueDateString: '2017-10-26T00:00:00',
			DueDate: '\/Date(1508976000000+0000)\/',
			Status: 'PAID',
			LineAmountTypes: 'Exclusive',
			LineItems: [],
			SubTotal: 135.00,
			TotalTax: 13.50,
			Total: 148.50,
			UpdatedDateUTC: '\/Date(1221560931500+0000)\/',
			CurrencyCode: 'AUD',
			FullyPaidOnDate: '\/Date(1508889600000+0000)\/'
		},
		{
			Type: 'ACCPAY',
			InvoiceID: '673dd7cc-beb7-4697-83d4-0c47cb400cc2',
			InvoiceNumber: '',
			Reference: '',
			Payments: [
				{
					PaymentID: '4d06f609-5200-4364-9c8b-d4379a945252',
					Date: '\/Date(1509840000000+0000)\/',
					Amount: 974.60,
					Reference: 'DD # 96013',
					HasAccount: false
				}
			],
			CreditNotes: [
				{
					CreditNoteID: '7df8949c-b71f-40c0-bbcf-39f2f450f286',
					CreditNoteNumber: '03391',
					DateString: '2017-10-31T00:00:00',
					Date: '\/Date(1509408000000+0000)\/',
					LineItems: [],
					Total: 218.90
				}
			],
			Prepayments: [],
			Overpayments: [],
			AmountDue: 0.00,
			AmountPaid: 974.60,
			AmountCredited: 218.90,
			HasErrors: false,
			IsDiscounted: false,
			HasAttachments: false,
			Contact: {
				ContactID: 'd0cd2c4f-18a0-4f7c-a32a-2db00f29d298',
				Name: 'PC Complete',
				Addresses: [],
				Phones: [],
				ContactGroups: [],
				ContactPersons: []
			},
			DateString: '2017-10-30T00:00:00',
			Date: '\/Date(1509321600000+0000)\/',
			DueDateString: '2017-11-06T00:00:00',
			DueDate: '\/Date(1509926400000+0000)\/',
			Status: 'PAID',
			LineAmountTypes: 'Exclusive',
			LineItems: [],
			SubTotal: 1085.00,
			TotalTax: 108.50,
			Total: 1193.50,
			UpdatedDateUTC: '\/Date(1221561913790+0000)\/',
			CurrencyCode: 'AUD',
			FullyPaidOnDate: '\/Date(1509840000000+0000)\/'
		}
	]
};

export const singleInvoice: InvoicesResponse = {
	Id: '964a6253-5544-45ad-84e1-73751c9300e1',
	Status: 'OK',
	ProviderName: 'Xero API Previewer',
	DateTimeUTC: '\/Date(1518681355590)\/',
	Invoices: [
		{
			Type: 'ACCPAY',
			InvoiceID: '0032f627-3156-4d30-9b1c-4d3b994dc921',
			InvoiceNumber: '9871',
			Reference: '',
			Payments: [
				{
					PaymentID: '22974891-3689-4694-9ee7-fd2ba917af55',
					Date: '\/Date(1508889600000+0000)\/',
					Amount: 148.50,
					Reference: 'Chq 409',
					CurrencyRate: 0.000000,
					HasAccount: false
				}
			],
			Prepayments: [],
			Overpayments: [],
			CISDeduction: 0.00,
			AmountDue: 0.00,
			AmountPaid: 148.50,
			AmountCredited: 0.00,
			SentToContact: false,
			HasErrors: false,
			IsDiscounted: false,
			HasAttachments: true,
			Contact: {
				ContactID: 'd6a384fb-f46f-41a3-8ac7-b7bc9e0b5efa',
				ContactStatus: 'ACTIVE',
				Name: 'Melrose Parking',
				EmailAddress: '',
				BankAccountDetails: '',
				Addresses: [
					{
						AddressType: 'POBOX',
						AddressLine1: 'Parking Administration\r\n',
						AddressLine2: 'P O Box 123\r\n',
						AddressLine3: '',
						AddressLine4: '',
						City: 'Melbourne',
						Region: '',
						PostalCode: '3333',
						Country: ''
					},
					{
						AddressType: 'STREET',
						AddressLine1: '',
						AddressLine2: '',
						AddressLine3: '',
						AddressLine4: '',
						City: '',
						Region: '',
						PostalCode: '',
						Country: ''
					}
				],
				Phones: [
					{
						PhoneType: 'DEFAULT',
						PhoneNumber: '4389376',
						PhoneAreaCode: '0800',
						PhoneCountryCode: ''
					},
					{
						PhoneType: 'MOBILE',
						PhoneNumber: '',
						PhoneAreaCode: '',
						PhoneCountryCode: ''
					},
					{
						PhoneType: 'FAX',
						PhoneNumber: '',
						PhoneAreaCode: '',
						PhoneCountryCode: ''
					},
					{
						PhoneType: 'DDI',
						PhoneNumber: '',
						PhoneAreaCode: '',
						PhoneCountryCode: ''
					}
				],
				UpdatedDateUTC: '\/Date(1516212222020+0000)\/',
				ContactGroups: [],
				IsSupplier: true,
				IsCustomer: false,
				SalesTrackingCategories: [],
				PurchasesTrackingCategories: [],
				ContactPersons: []
			},
			DateString: '2017-10-17T00:00:00',
			Date: '\/Date(1508198400000+0000)\/',
			DueDateString: '2017-10-26T00:00:00',
			DueDate: '\/Date(1508976000000+0000)\/',
			Status: 'PAID',
			LineAmountTypes: 'Exclusive',
			LineItems: [
				{
					Description: 'Company car park (month in advance)',
					UnitAmount: 135.00,
					TaxType: 'INPUT',
					TaxAmount: 13.50,
					LineAmount: 135.00,
					AccountCode: '449',
					Tracking: [],
					Quantity: 1.0000,
					LineItemID: 'c997b810-b637-439d-9036-93fd4319011f'
				}
			],
			SubTotal: 135.00,
			TotalTax: 13.50,
			Total: 148.50,
			UpdatedDateUTC: '\/Date(1221560931500+0000)\/',
			CurrencyCode: 'AUD',
			FullyPaidOnDate: '\/Date(1508889600000+0000)\/'
		}
	]
};

export const createInvoiceWithValidationError: InvoicesResponse = {
	Id: '83a0044f-bbf9-4242-a1df-00e9402fe6ea',
	Status: 'OK',
	ProviderName: 'Node - Private',
	DateTimeUTC: '\/Date(1518938572217)\/',
	Invoices: [
		{
			Type: 'IMNOTAREALTYPE',
			InvoiceID: '00000000-0000-0000-0000-000000000000',
			Payments: [],
			CreditNotes: [],
			Prepayments: [],
			Overpayments: [],
			HasErrors: true,
			IsDiscounted: false,
			Contact: {
				ContactID: '899985a6-f05c-40e7-a18b-28eb760df75b',
				Name: 'Martin Hudson',
				Addresses: [],
				Phones: [],
				ContactGroups: [],
				ContactPersons: [],
			},
			DateString: '2018-02-15T00:00:00',
			Date: '\/Date(1518652800000+0000)\/',
			DueDateString: '2018-02-22T00:00:00',
			DueDate: '\/Date(1519257600000+0000)\/',
			Status: 'DRAFT',
			LineAmountTypes: 'Exclusive',
			LineItems: [
				{
					Description: 'Monthly rental for property at 56a Wilkins Avenue',
					UnitAmount: 395.0,
					AccountCode: '200',
					Tracking: [],
					Quantity: 4.3400
				}
			],
			CurrencyCode: 'AUD',
			StatusAttributeString: 'ERROR',
			ValidationErrors: [
				{
					Message: 'Invoice not of valid type for creation'
				},
				{
					Message: 'An error occurred in Xero. Check the API Status page http://status.developer.xero.com for current service status. Contact the API support team at api@xero.com for more assistance.'
				}
			]
		}
	]
};
