import { Button, ButtonGroup } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useRoute, useTranslation } from '@rocket.chat/ui-contexts';
import React, { lazy, useMemo } from 'react';

import { Page, PageHeader, PageContent } from '../../../components/Page';

const BusinessHoursPage = () => {
	const t = useTranslation();
	const router = useRoute('omnichannel-businessHours');

	const BusinessHoursTable = useMemo(() => lazy(() => import('../../../../ee/client/omnichannel/BusinessHoursTable')), []);

	const handleNew = useMutableCallback(() => {
		router.push({
			context: 'new',
		});
	});

	return (
		<Page>
			<PageHeader title={t('Business_Hours')}>
				<ButtonGroup>
					<Button icon='plus' onClick={handleNew}>
						{t('New')}
					</Button>
				</ButtonGroup>
			</PageHeader>
			<PageContent>
				<BusinessHoursTable />
			</PageContent>
		</Page>
	);
};

export default BusinessHoursPage;
