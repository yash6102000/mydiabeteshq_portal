import { useRouteParameter, useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useRef } from 'react';

import { Page, PageHeader, PageContent } from '../../../../../client/components/Page';
import DeviceManagementAdminTable from './DeviceManagementAdminTable';
import DeviceManagementInfo from './DeviceManagementInfo';

const DeviceManagementAdminPage = (): ReactElement => {
	const t = useTranslation();
	const context = useRouteParameter('context');
	const deviceId = useRouteParameter('id');

	const reloadRef = useRef(() => null);

	return (
		<Page flexDirection='row'>
			<Page>
				<PageHeader title={t('Device_Management')} />
				<PageContent>
					<DeviceManagementAdminTable reloadRef={reloadRef} />
				</PageContent>
			</Page>
			{context === 'info' && deviceId && <DeviceManagementInfo deviceId={deviceId} onReload={reloadRef.current} />}
		</Page>
	);
};

export default DeviceManagementAdminPage;
