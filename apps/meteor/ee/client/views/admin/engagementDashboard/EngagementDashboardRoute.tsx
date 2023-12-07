import { usePermission, useRouter, useSetModal, useCurrentModal, useTranslation, useRouteParameter } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useEffect } from 'react';

import { getURL } from '../../../../../app/utils/client/getURL';
import GenericUpsellModal from '../../../../../client/components/GenericUpsellModal';
import { useUpsellActions } from '../../../../../client/components/GenericUpsellModal/hooks';
import PageSkeleton from '../../../../../client/components/PageSkeleton';
import { useEndpointAction } from '../../../../../client/hooks/useEndpointAction';
import NotAuthorizedPage from '../../../../../client/views/notAuthorized/NotAuthorizedPage';
import { useHasLicenseModule } from '../../../hooks/useHasLicenseModule';
import EngagementDashboardPage from './EngagementDashboardPage';

const isValidTab = (tab: string | undefined): tab is 'users' | 'messages' | 'channels' =>
	typeof tab === 'string' && ['users', 'messages', 'channels'].includes(tab);

const EngagementDashboardRoute = (): ReactElement | null => {
	const t = useTranslation();
	const canViewEngagementDashboard = usePermission('view-engagement-dashboard');
	const setModal = useSetModal();
	const isModalOpen = useCurrentModal() !== null;

	const router = useRouter();
	const tab = useRouteParameter('tab');
	const eventStats = useEndpointAction('POST', '/v1/statistics.telemetry');

	const hasEngagementDashboard = useHasLicenseModule('engagement-dashboard') as boolean;

	const { shouldShowUpsell, handleManageSubscription } = useUpsellActions(hasEngagementDashboard);

	useEffect(() => {
		if (shouldShowUpsell) {
			setModal(
				<GenericUpsellModal
					title={t('Engagement_Dashboard')}
					img={getURL('images/engagement.png')}
					subtitle={t('Analyze_practical_usage')}
					description={t('Enrich_your_workspace')}
					onClose={() => setModal(null)}
					onConfirm={handleManageSubscription}
					onCancel={() => setModal(null)}
				/>,
			);
		}

		router.subscribeToRouteChange(() => {
			if (!isValidTab(tab)) {
				router.navigate(
					{
						pattern: '/admin/engagement/:tab?',
						params: { tab: 'users' },
					},
					{ replace: true },
				);
			}
		});
	}, [shouldShowUpsell, router, tab, setModal, t, handleManageSubscription]);

	if (isModalOpen) {
		return <PageSkeleton />;
	}

	if (!canViewEngagementDashboard || !hasEngagementDashboard) {
		return <NotAuthorizedPage />;
	}

	eventStats({
		params: [{ eventName: 'updateCounter', settingsId: 'Engagement_Dashboard_Load_Count' }],
	});

	return (
		<EngagementDashboardPage
			tab={tab as 'users' | 'messages' | 'channels'}
			onSelectTab={(tab) =>
				router.navigate({
					pattern: '/admin/engagement/:tab?',
					params: { tab },
				})
			}
		/>
	);
};

export default EngagementDashboardRoute;
