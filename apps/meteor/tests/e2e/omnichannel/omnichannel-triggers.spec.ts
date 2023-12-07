import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';

import { createAuxContext } from '../fixtures/createAuxContext';
import { Users } from '../fixtures/userStates';
import { OmnichannelLiveChat, HomeOmnichannel } from '../page-objects';
import { test, expect } from '../utils/test';

test.describe.serial('omnichannel-triggers', () => {
	let triggersName: string;
	let triggerMessage: string;
	let poLiveChat: OmnichannelLiveChat;
	let newUser: { email: string; name: string };
	let agent: { page: Page; poHomeOmnichannel: HomeOmnichannel };

	test.beforeAll(async ({ api, browser }) => {
		newUser = {
			name: faker.person.firstName(),
			email: faker.internet.email(),
		};
		triggersName = faker.string.uuid();
		triggerMessage = 'This is a trigger message';
		const requests = await Promise.all([
			api.post('/livechat/users/agent', { username: 'user1' }),
			api.post('/livechat/users/manager', { username: 'user1' }),
			api.post('/settings/Livechat_clear_local_storage_when_chat_ended', { value: true }),
		]);
		requests.every((e) => expect(e.status()).toBe(200));

		const { page } = await createAuxContext(browser, Users.user1, '/omnichannel/triggers');
		agent = { page, poHomeOmnichannel: new HomeOmnichannel(page) };
		await page.emulateMedia({ reducedMotion: 'reduce' });
	});

	test.beforeEach(async ({ page, api }) => {
		poLiveChat = new OmnichannelLiveChat(page, api);
	});

	test.afterAll(async ({ api }) => {
		await Promise.all([
			api.delete('/livechat/users/agent/user1'),
			api.delete('/livechat/users/manager/user1'),
			api.delete(`/livechat/triggers/${triggersName}`),
			api.post('/settings/Livechat_clear_local_storage_when_chat_ended', { value: false }),
		]);
		await agent.page.close();
	});

	test('trigger baseline', async ({ page }) => {
		await page.goto('/livechat');
		await poLiveChat.openLiveChat();

		await test.step('expect to register visitor', async () => {
			await expect(poLiveChat.btnChatNow).not.toBeVisible();
			await poLiveChat.sendMessage(newUser, false);
		});

		await test.step('expect send a message as a visitor', async () => {
			await poLiveChat.onlineAgentMessage.type('this_a_test_message_from_user');
			await poLiveChat.btnSendMessageToOnlineAgent.click();
			await expect(poLiveChat.txtChatMessage('this_a_test_message_from_user')).toBeVisible();
		});

		await test.step('expect to finish this chat', async () => {
			await poLiveChat.closeChat();
			await expect(poLiveChat.txtHeaderTitle).toBeVisible();
		});
	});

	test('create and edit trigger', async () => {
		await test.step('expect create new trigger', async () => {
			await agent.poHomeOmnichannel.triggers.createTrigger(triggersName, triggerMessage);
			await agent.poHomeOmnichannel.triggers.btnCloseToastMessage.click();
		});

		await test.step('expect update trigger', async () => {
			await agent.poHomeOmnichannel.triggers.firstRowInTriggerTable(triggersName).click();
			await agent.poHomeOmnichannel.triggers.updateTrigger(triggersName);
			await agent.poHomeOmnichannel.triggers.btnCloseToastMessage.click();
		});
	});

	test('trigger condition: chat opened by visitor', async ({ page }) => {
		await test.step('expect to start conversation', async () => {
			await page.goto('/livechat');
			await poLiveChat.openLiveChat();
		});

		await test.step('expect trigger message before registration', async () => {
			await expect(poLiveChat.txtChatMessage(triggerMessage)).toBeVisible();
		});

		await test.step('expect to register visitor', async () => {
			await poLiveChat.btnChatNow.click();
			await poLiveChat.sendMessage(newUser, false);
		});

		await test.step('expect trigger message after registration', async () => {
			await expect(poLiveChat.txtChatMessage(triggerMessage)).not.toBeVisible();
		});

		await test.step('expect send a message as a visitor', async () => {
			await poLiveChat.onlineAgentMessage.type('this_a_test_message_from_user');
			await poLiveChat.btnSendMessageToOnlineAgent.click();
			await expect(poLiveChat.txtChatMessage('this_a_test_message_from_user')).toBeVisible();
		});

		await test.step('expect to finish this chat', async () => {
			await poLiveChat.closeChat();
			await expect(poLiveChat.txtHeaderTitle).toBeVisible();
		});
	});

	test('trigger condition: after guest registration', async ({ page }) => {
		await test.step('expect update trigger to after guest registration', async () => {
			await agent.poHomeOmnichannel.triggers.firstRowInTriggerTable(`edited-${triggersName}`).click();
			await agent.poHomeOmnichannel.triggers.fillTriggerForm({ condition: 'after-guest-registration', triggerMessage });
			await agent.poHomeOmnichannel.triggers.btnSave.click();
			await agent.poHomeOmnichannel.triggers.btnCloseToastMessage.click();
			await agent.page.waitForTimeout(500);
		});

		await test.step('expect to start conversation', async () => {
			await page.goto('/livechat');
			await poLiveChat.openLiveChat();
		});

		await test.step('expect not to have trigger message before registration', async () => {
			await expect(poLiveChat.txtChatMessage(triggerMessage)).not.toBeVisible();
			await expect(poLiveChat.btnChatNow).not.toBeVisible();
		});

		await test.step('expect to register visitor', async () => {
			await poLiveChat.sendMessage(newUser, false);
		});

		await test.step('expect trigger message after registration', async () => {
			await expect(poLiveChat.txtChatMessage(triggerMessage)).toBeVisible();
		});

		await test.step('expect send a message as a visitor', async () => {
			await poLiveChat.onlineAgentMessage.type('this_a_test_message_from_user');
			await poLiveChat.btnSendMessageToOnlineAgent.click();
			await expect(poLiveChat.txtChatMessage('this_a_test_message_from_user')).toBeVisible();
		});

		await test.step('expect to finish this chat', async () => {
			await poLiveChat.closeChat();
			await expect(poLiveChat.txtHeaderTitle).toBeVisible();
		});
	});

	test('delete trigger', async () => {
		await agent.poHomeOmnichannel.triggers.btnDeletefirstRowInTable.click();
		await agent.poHomeOmnichannel.triggers.btnModalRemove.click();
		await expect(agent.poHomeOmnichannel.triggers.removeToastMessage).toBeVisible();
	});
});
