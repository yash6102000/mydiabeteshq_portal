import { HeaderTag, HeaderTagIcon } from '@rocket.chat/ui-client';
import type { ReactElement } from 'react';
import React, { useMemo } from 'react';

import type { IRoomWithFederationOriginalName } from '../contexts/RoomContext';

type FederatedRoomProps = {
	room: IRoomWithFederationOriginalName;
};

const FederatedRoomOriginServer = ({ room }: FederatedRoomProps): ReactElement | null => {
	const originServerName = useMemo(() => room.federationOriginalName?.split(':')[1], [room.federationOriginalName]);
	if (!originServerName) {
		return null;
	}
	return (
		<HeaderTag data-qa='federated-origin-server-name'>
			<HeaderTagIcon icon={{ name: 'globe' }} />
			{originServerName}
		</HeaderTag>
	);
};

export default FederatedRoomOriginServer;
