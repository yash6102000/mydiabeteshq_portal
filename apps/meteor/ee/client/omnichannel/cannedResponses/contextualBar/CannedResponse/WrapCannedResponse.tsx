import type { ILivechatDepartment, IOmnichannelCannedResponse } from '@rocket.chat/core-typings';
import { useSetModal, usePermission } from '@rocket.chat/ui-contexts';
import type { FC, MouseEvent, MouseEventHandler } from 'react';
import React, { memo } from 'react';

import CreateCannedResponse from '../../modals/CreateCannedResponse';
import CannedResponse from './CannedResponse';

const WrapCannedResponse: FC<{
	allowUse: boolean;
	cannedItem: IOmnichannelCannedResponse & { departmentName: ILivechatDepartment['name'] };
	onClickBack: MouseEventHandler<HTMLOrSVGElement>;
	onClickUse: (e: MouseEvent<HTMLOrSVGElement>, text: string) => void;
	reload: () => void;
}> = ({ allowUse, cannedItem, onClickBack, onClickUse, reload }) => {
	const setModal = useSetModal();
	const onClickEdit = (): void => {
		setModal(<CreateCannedResponse cannedResponseData={cannedItem} onClose={() => setModal(null)} reloadCannedList={reload} />);
	};

	const hasManagerPermission = usePermission('view-all-canned-responses');
	const hasMonitorPermission = usePermission('save-department-canned-responses');

	const allowEdit = hasManagerPermission || (hasMonitorPermission && cannedItem.scope !== 'global') || cannedItem.scope === 'user';

	return (
		<CannedResponse
			allowEdit={allowEdit}
			allowUse={allowUse}
			data={cannedItem}
			onClickBack={onClickBack}
			onClickEdit={onClickEdit}
			onClickUse={(e): void => {
				onClickUse(e, cannedItem?.text);
			}}
		/>
	);
};

export default memo(WrapCannedResponse);
