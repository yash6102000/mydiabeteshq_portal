import type { ICreatedRoom } from '@rocket.chat/core-typings';
import { Users } from '@rocket.chat/models';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import { Match, check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';
import { createRoom } from '../functions/createRoom';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		createChannel(
			name: string,
			members: string[],
			readOnly?: boolean,
			customFields?: Record<string, any>,
			extraData?: Record<string, any>,
		): ICreatedRoom;
	}
}

export const createChannelMethod = async (
	userId: string,
	name: string,
	members: string[],
	readOnly = false,
	customFields: Record<string, any> = {},
	extraData: Record<string, any> = {},
	excludeSelf = false,
) => {
	check(name, String);
	check(members, Match.Optional([String]));
	if (!userId) {
		throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'createChannel' });
	}

	const user = await Users.findOneById(userId);
	if (!user?.username) {
		throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'createChannel' });
	}

	if (!(await hasPermissionAsync(userId, 'create-c'))) {
		throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'createChannel' });
	}
	return createRoom('c', name, user, members, excludeSelf, readOnly, {
		customFields,
		...extraData,
	});
};

Meteor.methods<ServerMethods>({
	async createChannel(name, members, readOnly = false, customFields = {}, extraData = {}) {
		const uid = Meteor.userId();

		if (!uid) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'createChannel' });
		}

		return createChannelMethod(uid, name, members, readOnly, customFields, extraData);
	},
});
