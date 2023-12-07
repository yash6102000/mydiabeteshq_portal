import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import type { Response } from 'supertest';

import { getCredentials, api, request, credentials } from '../../../data/api-data';
import { removePermissionFromAllRoles, restorePermissionToRoles, updatePermission, updateSetting } from '../../../data/permissions.helper';

describe('LIVECHAT - appearance', function () {
	this.retries(0);

	before((done) => getCredentials(done));

	before(async () => {
		await updateSetting('Livechat_enabled', true);
	});

	describe('livechat/appearance', () => {
		it('should return an "unauthorized error" when the user does not have the necessary permission', async () => {
			await updatePermission('view-livechat-manager', []);
			await request.get(api('livechat/appearance')).set(credentials).expect('Content-Type', 'application/json').expect(403);
		});
		it('should return an array of settings', async () => {
			await updatePermission('view-livechat-manager', ['admin']);
			await request
				.get(api('livechat/appearance'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body.appearance).to.be.an('array');
				});
		});
	});

	describe('POST livechat/appearance', () => {
		it('should fail if user is not logged in', async () => {
			await request.post(api('livechat/appearance')).send({}).expect(401);
		});
		it('should fail if body is not an array', async () => {
			await request.post(api('livechat/appearance')).set(credentials).send({}).expect(400);
		});
		it('should fail if body is an empty array', async () => {
			await request.post(api('livechat/appearance')).set(credentials).send([]).expect(400);
		});
		it('should fail if body does not contain value', async () => {
			await request
				.post(api('livechat/appearance'))
				.set(credentials)
				.send([{ name: 'Livechat_title' }])
				.expect(400);
		});
		it('should fail if body does not contain name', async () => {
			await request
				.post(api('livechat/appearance'))
				.set(credentials)
				.send([{ value: 'test' }])
				.expect(400);
		});
		it('should fail if user does not have the necessary permission', async () => {
			await removePermissionFromAllRoles('view-livechat-manager');
			await request
				.post(api('livechat/appearance'))
				.set(credentials)
				.send([{ _id: 'invalid', value: 'test' }])
				.expect(403);
		});
		it('should fail if body contains invalid _id', async () => {
			await restorePermissionToRoles('view-livechat-manager');
			await request
				.post(api('livechat/appearance'))
				.set(credentials)
				.send([{ _id: 'invalid', value: 'test' }])
				.expect(400);
		});
		it('should update the settings', async () => {
			await request
				.post(api('livechat/appearance'))
				.set(credentials)
				.send([{ _id: 'Livechat_title', value: 'test' }])
				.expect(200);
		});
		// Test for: https://github.com/ajv-validator/ajv/issues/1140
		it('should update a boolean setting and keep it as boolean', async () => {
			await request
				.post(api('livechat/appearance'))
				.set(credentials)
				.send([{ _id: 'Livechat_registration_form', value: true }])
				.expect(200);

			// Get data from livechat/config
			const { body } = await request.get(api('livechat/config')).set(credentials).expect(200);
			expect(body.config.settings.registrationForm).to.be.true;
		});
		it('should update a boolean setting and keep it as boolean', async () => {
			await request
				.post(api('livechat/appearance'))
				.set(credentials)
				.send([{ _id: 'Livechat_registration_form', value: false }])
				.expect(200);

			// Get data from livechat/config
			const { body } = await request.get(api('livechat/config')).set(credentials).expect(200);
			expect(body.config.settings.registrationForm).to.be.false;
		});
		it('should update a number setting and keep it as number', async () => {
			await updateSetting('Livechat_enable_message_character_limit', true);
			await request
				.post(api('livechat/appearance'))
				.set(credentials)
				.send([{ _id: 'Livechat_message_character_limit', value: 100 }])
				.expect(200);

			// Get data from livechat/config
			const { body } = await request.get(api('livechat/config')).set(credentials).expect(200);
			expect(body.config.settings.limitTextLength).to.be.equal(100);
			await updateSetting('Livechat_enable_message_character_limit', false);
		});
	});
});
