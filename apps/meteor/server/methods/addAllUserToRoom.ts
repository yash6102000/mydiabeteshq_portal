import { Message } from '@rocket.chat/core-services';
import type { IRoom } from '@rocket.chat/core-typings';
import { Subscriptions, Rooms, Users } from '@rocket.chat/models';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

import { hasPermissionAsync } from '../../app/authorization/server/functions/hasPermission';
import { settings } from '../../app/settings/server';
import { callbacks } from '../../lib/callbacks';
import { getSubscriptionAutotranslateDefaultConfig } from '../lib/getSubscriptionAutotranslateDefaultConfig';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		addAllUserToRoom(rid: IRoom['_id'], activeUsersOnly?: boolean): Promise<true>;
	}
}

Meteor.methods<ServerMethods>({
	async addAllUserToRoom(rid, activeUsersOnly = false) {
		check(rid, String);
		check(activeUsersOnly, Boolean);

		if (!this.userId || !(await hasPermissionAsync(this.userId, 'add-all-to-room'))) {
			throw new Meteor.Error(403, 'Access to Method Forbidden', {
				method: 'addAllToRoom',
			});
		}

		const userFilter: {
			active?: boolean;
		} = {};
		if (activeUsersOnly === true) {
			userFilter.active = true;
		}

		const users = await Users.find(userFilter).toArray();
		if (users.length > settings.get<number>('API_User_Limit')) {
			throw new Meteor.Error('error-user-limit-exceeded', 'User Limit Exceeded', {
				method: 'addAllToRoom',
			});
		}

		const room = await Rooms.findOneById(rid);
		if (!room) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', {
				method: 'addAllToRoom',
			});
		}

		const now = new Date();
		for await (const user of users) {
			const subscription = await Subscriptions.findOneByRoomIdAndUserId(rid, user._id);
			if (subscription != null) {
				continue;
			}
			await callbacks.run('beforeJoinRoom', user, room);
			const autoTranslateConfig = getSubscriptionAutotranslateDefaultConfig(user);
			await Subscriptions.createWithRoomAndUser(room, user, {
				ts: now,
				open: true,
				alert: true,
				unread: 1,
				userMentions: 1,
				groupMentions: 0,
				...autoTranslateConfig,
			});
			await Message.saveSystemMessage('uj', rid, user.username || '', user, { ts: now });
			await callbacks.run('afterJoinRoom', user, room);
		}
		return true;
	},
});
