import { AccountingAPIClient } from '../AccountingAPIClient';
import { getOrCreateContactGroupId, getOrCreateContactId, getOrCreateContactIdInContactGroup } from './helpers/entityId.helpers';
import { getPrivateConfig, setJestTimeout } from './helpers/integration.helpers';
import { isUUID } from './helpers/test-assertions';

describe('/contactgroups', () => {

	let xero: AccountingAPIClient;
	let _idsToDelete: string[] = [];

	beforeAll(async () => {
		setJestTimeout();
		const config = getPrivateConfig('1');
		xero = new AccountingAPIClient(config);
	});

	it('get single', async () => {
		const response = await xero.contactGroups.get({ ContactGroupID: await getOrCreateContactGroupId(xero) });

		expect(response).toBeTruthy();
		expect(isUUID(response.Id)).toBeTruthy();
		expect(response.ContactGroups.length).toBe(1);
	});

	it('get all', async () => {
		const response = await xero.contactGroups.get();

		expect(response).toBeTruthy();
		expect(isUUID(response.Id)).toBeTruthy();
		expect(response.ContactGroups.length).toBeGreaterThan(0);
	});

	it('create', async () => {
		const uniqueName = 'NewContactGroup' + new Date().getTime();
		const response = await xero.contactGroups.create({
			Name: uniqueName,
			Status: 'ACTIVE'
		});

		_idsToDelete = _idsToDelete.concat(response.ContactGroups[0].ContactGroupID);

		expect(response).toBeTruthy();
		expect(isUUID(response.ContactGroups[0].ContactGroupID)).toBeTruthy();
		expect(response.ContactGroups[0].Name).toBe(uniqueName);

	});

	it('delete', async () => {
		const response = await xero.contactGroups.update({
			ContactGroupID: await getOrCreateContactGroupId(xero, false),
			Status: 'DELETED'
		});

		expect(response).toBeTruthy();
		expect(response.ContactGroups.length).toBe(1);
		expect(response.ContactGroups[0].Status).toBe('DELETED');
	});

	describe('contacts', () => {

		it('add to group', async () => {
			const contactId = await getOrCreateContactId(xero);
			const response = await xero.contactGroups.contacts.create({ ContactID: contactId }, { ContactGroupID: await getOrCreateContactGroupId(xero) });

			expect(response.Contacts.length).toBe(1);
		});

		it('delete all from group', async () => {
			const contactGroupId = await getOrCreateContactGroupId(xero);

			const response = await xero.contactGroups.contacts.delete({ ContactGroupID: contactGroupId });
			expect(response).toBeNull();

			const getResponse = await xero.contactGroups.get({ ContactGroupID: contactGroupId });
			expect(getResponse.ContactGroups[0].Contacts.length).toBe(0);
		});

		it('delete single from group', async () => {
			const contactGroupId = await getOrCreateContactGroupId(xero);
			const contactId = await getOrCreateContactIdInContactGroup(xero, contactGroupId);

			expect.assertions(2);

			const response = await xero.contactGroups.contacts.delete({ ContactGroupID: contactGroupId, ContactID: contactId });
			expect(response).toBeNull();

			const getResponse = await xero.contactGroups.get({ ContactGroupID: contactGroupId });
			expect(getResponse.ContactGroups[0].Contacts.map((contact) => contact.ContactID)).not.toContainEqual(contactId);
		});

	});

	afterAll(async () => {
		await Promise.all(_idsToDelete.map((id) => xero.contactGroups.update({
			ContactGroupID: id,
			Status: 'DELETED'
		})));
	});
});
