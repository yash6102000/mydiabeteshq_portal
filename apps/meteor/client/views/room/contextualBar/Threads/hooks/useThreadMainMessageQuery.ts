import type { IMessage, IThreadMainMessage } from '@rocket.chat/core-typings';
import { useStream } from '@rocket.chat/ui-contexts';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

import { withDebouncing } from '../../../../../../lib/utils/highOrderFunctions';
import type { FieldExpression, Query } from '../../../../../lib/minimongo';
import { createFilterFromQuery } from '../../../../../lib/minimongo';
import { useRoom } from '../../../contexts/RoomContext';
import { useGetMessageByID } from './useGetMessageByID';

type RoomMessagesRidEvent = IMessage;

type NotifyRoomRidDeleteMessageBulkEvent = {
	rid: IMessage['rid'];
	excludePinned: boolean;
	ignoreDiscussion: boolean;
	ts: FieldExpression<Date>;
	users: string[];
};

const createDeleteCriteria = (params: NotifyRoomRidDeleteMessageBulkEvent): ((message: IMessage) => boolean) => {
	const query: Query<IMessage> = { ts: params.ts };

	if (params.excludePinned) {
		query.pinned = { $ne: true };
	}

	if (params.ignoreDiscussion) {
		query.drid = { $exists: false };
	}
	if (params.users?.length) {
		query['u.username'] = { $in: params.users };
	}

	return createFilterFromQuery<IMessage>(query);
};

const useSubscribeToMessage = () => {
	const subscribeToRoomMessages = useStream('room-messages');
	const subscribeToNotifyRoom = useStream('notify-room');

	return useCallback(
		(message: IMessage, { onMutate, onDelete }: { onMutate?: (message: IMessage) => void; onDelete?: () => void }) => {
			const unsubscribeFromRoomMessages = subscribeToRoomMessages(message.rid, (event: RoomMessagesRidEvent) => {
				if (message._id === event._id) onMutate?.(event);
			});

			const unsubscribeFromDeleteMessage = subscribeToNotifyRoom(`${message.rid}/deleteMessage`, (event) => {
				if (message._id === event._id) onDelete?.();
			});

			const unsubscribeFromDeleteMessageBulk = subscribeToNotifyRoom(`${message.rid}/deleteMessageBulk`, (params) => {
				const matchDeleteCriteria = createDeleteCriteria(params);
				if (matchDeleteCriteria(message)) onDelete?.();
			});

			return () => {
				unsubscribeFromRoomMessages();
				unsubscribeFromDeleteMessage();
				unsubscribeFromDeleteMessageBulk();
			};
		},
		[subscribeToNotifyRoom, subscribeToRoomMessages],
	);
};

export const useThreadMainMessageQuery = (
	tmid: IMessage['_id'],
	{ onDelete }: { onDelete?: () => void } = {},
): UseQueryResult<IThreadMainMessage, Error> => {
	const room = useRoom();

	const getMessage = useGetMessageByID();
	const subscribeToMessage = useSubscribeToMessage();

	const queryClient = useQueryClient();
	const unsubscribeRef = useRef<(() => void) | undefined>();

	useEffect(() => {
		return () => {
			unsubscribeRef.current?.();
			unsubscribeRef.current = undefined;
		};
	}, [tmid]);

	return useQuery(['rooms', room._id, 'threads', tmid, 'main-message'] as const, async ({ queryKey }) => {
		const mainMessage = await getMessage(tmid);

		if (!mainMessage) {
			throw new Error('Invalid main message');
		}

		const debouncedInvalidate = withDebouncing({ wait: 10000 })(() => {
			queryClient.invalidateQueries(queryKey, { exact: true });
		});

		unsubscribeRef.current =
			unsubscribeRef.current ||
			subscribeToMessage(mainMessage, {
				onMutate: (message) => {
					queryClient.setQueryData(queryKey, () => message);
					debouncedInvalidate();
				},
				onDelete: () => {
					onDelete?.();
					queryClient.invalidateQueries(queryKey, { exact: true });
				},
			});

		return mainMessage;
	});
};
