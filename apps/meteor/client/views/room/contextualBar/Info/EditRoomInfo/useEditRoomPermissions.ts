import type { IRoom, IRoomWithRetentionPolicy } from '@rocket.chat/core-typings';
import { usePermission, useAtLeastOnePermission, useRole } from '@rocket.chat/ui-contexts';
import { useMemo } from 'react';

import { e2e } from '../../../../../../app/e2e/client/rocketchat.e2e';
import { RoomSettingsEnum } from '../../../../../../definition/IRoomTypeConfig';
import { roomCoordinator } from '../../../../../lib/rooms/roomCoordinator';

const getCanChangeType = (room: IRoom | IRoomWithRetentionPolicy, canCreateChannel: boolean, canCreateGroup: boolean, isAdmin: boolean) =>
	(!room.default || isAdmin) && ((room.t === 'p' && canCreateChannel) || (room.t === 'c' && canCreateGroup));

export const useEditRoomPermissions = (room: IRoom | IRoomWithRetentionPolicy) => {
	const isAdmin = useRole('admin');
	const canCreateChannel = usePermission('create-c');
	const canCreateGroup = usePermission('create-p');

	const canChangeType = getCanChangeType(room, canCreateChannel, canCreateGroup, isAdmin);
	const canSetReadOnly = usePermission('set-readonly', room._id);
	const canSetReactWhenReadOnly = usePermission('set-react-when-readonly', room._id);
	const canEditRoomRetentionPolicy = usePermission('edit-room-retention-policy', room._id);
	const canArchiveOrUnarchive = useAtLeastOnePermission(
		useMemo(() => ['archive-room', 'unarchive-room'], []),
		room._id,
	);
	const canToggleEncryption = usePermission('toggle-room-e2e-encryption', room._id) && (room.encrypted || e2e.isReady());

	const [
		canViewName,
		canViewTopic,
		canViewAnnouncement,
		canViewArchived,
		canViewDescription,
		canViewType,
		canViewReadOnly,
		canViewHideSysMes,
		canViewJoinCode,
		canViewEncrypted,
	] = useMemo(() => {
		const isAllowed =
			roomCoordinator.getRoomDirectives(room.t)?.allowRoomSettingChange ||
			(() => {
				undefined;
			});
		return [
			isAllowed(room, RoomSettingsEnum.NAME),
			isAllowed(room, RoomSettingsEnum.TOPIC),
			isAllowed(room, RoomSettingsEnum.ANNOUNCEMENT),
			isAllowed(room, RoomSettingsEnum.ARCHIVE_OR_UNARCHIVE),
			isAllowed(room, RoomSettingsEnum.DESCRIPTION),
			isAllowed(room, RoomSettingsEnum.TYPE),
			isAllowed(room, RoomSettingsEnum.READ_ONLY),
			isAllowed(room, RoomSettingsEnum.SYSTEM_MESSAGES),
			isAllowed(room, RoomSettingsEnum.JOIN_CODE),
			isAllowed(room, RoomSettingsEnum.REACT_WHEN_READ_ONLY),
			isAllowed(room, RoomSettingsEnum.E2E),
		];
	}, [room]);

	return {
		canChangeType,
		canSetReadOnly,
		canSetReactWhenReadOnly,
		canEditRoomRetentionPolicy,
		canArchiveOrUnarchive,
		canToggleEncryption,
		canViewName,
		canViewTopic,
		canViewAnnouncement,
		canViewArchived,
		canViewDescription,
		canViewType,
		canViewReadOnly,
		canViewHideSysMes,
		canViewJoinCode,
		canViewEncrypted,
	};
};
