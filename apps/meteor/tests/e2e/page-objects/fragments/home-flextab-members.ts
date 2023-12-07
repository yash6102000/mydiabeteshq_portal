import type { Page } from '@playwright/test';

export class HomeFlextabMembers {
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async addUser(username: string) {
		await this.page.locator('role=button[name="Add"]').click();
		await this.page.locator('//label[contains(text(), "Choose users")]/..//input').type(username);
		await this.page.locator(`[data-qa-type="autocomplete-user-option"] >> text=${username}`).first().click();
		await this.page.locator('role=button[name="Add users"]').click();
	}

	async inviteUser() {
		await this.page.locator('role=button[name="Invite Link"]').click();
	}

	async muteUser(username: string) {
		await this.page.locator(`[data-qa="MemberItem-${username}"]`).click();
		await this.page.locator('role=button[name="More"]').click();
		await this.page.locator('role=menuitem[name="Mute user"]').click();
		await this.page.locator('.rcx-modal .rcx-button--danger').click();
		await this.page.locator('(//main//aside/h3//button)[1]').click();
	}

	async setUserAsModerator(username: string) {
		await this.page.locator(`[data-qa="MemberItem-${username}"]`).click();
		await this.page.locator('role=button[name="More"]').click();
		await this.page.locator('role=menuitem[name="Set as moderator"]').click();
	}

	async setUserAsOwner(username: string) {
		await this.page.locator(`[data-qa="MemberItem-${username}"]`).click();
		await this.page.locator('role=button[name="Set as owner"]').click();
	}

	async showAllUsers() {
		await this.page.locator('.rcx-select >> text=Online').first().click();
		await this.page.locator('.rcx-option:has-text("All")').first().click();
	}
}
