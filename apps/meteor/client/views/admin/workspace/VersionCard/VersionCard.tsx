import type { IWorkspaceInfo } from '@rocket.chat/core-typings';
import { Box, Icon } from '@rocket.chat/fuselage';
import { useMediaQuery } from '@rocket.chat/fuselage-hooks';
import type { SupportedVersions } from '@rocket.chat/server-cloud-communication';
import { Card, CardBody, CardCol, CardColSection, CardColTitle, CardFooter, ExternalLink } from '@rocket.chat/ui-client';
import type { LocationPathname } from '@rocket.chat/ui-contexts';
import { useModal, useMediaUrl } from '@rocket.chat/ui-contexts';
import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useFormatDate } from '../../../../hooks/useFormatDate';
import { useLicense, useLicenseName } from '../../../../hooks/useLicense';
import { useRegistrationStatus } from '../../../../hooks/useRegistrationStatus';
import { isOverLicenseLimits } from '../../../../lib/utils/isOverLicenseLimits';
import VersionCardActionButton from './components/VersionCardActionButton';
import type { VersionActionItem } from './components/VersionCardActionItem';
import VersionCardActionItemList from './components/VersionCardActionItemList';
import { VersionCardSkeleton } from './components/VersionCardSkeleton';
import { VersionTag } from './components/VersionTag';
import { getVersionStatus } from './getVersionStatus';
import RegisterWorkspaceModal from './modals/RegisterWorkspaceModal';

const SUPPORT_EXTERNAL_LINK = 'https://go.rocket.chat/i/version-support';
const RELEASES_EXTERNAL_LINK = 'https://go.rocket.chat/i/update-product';

type VersionCardProps = {
	serverInfo: IWorkspaceInfo;
};

const VersionCard = ({ serverInfo }: VersionCardProps): ReactElement => {
	const mediaQuery = useMediaQuery('(min-width: 1024px)');

	const getUrl = useMediaUrl();
	const cardBackground = {
		backgroundImage: `url(${getUrl('images/globe.png')})`,
		backgroundRepeat: 'no-repeat',
		backgroundPosition: 'right 20px center',
		backgroundSize: mediaQuery ? 'auto' : 'contain',
	};

	const { setModal } = useModal();

	const { t } = useTranslation();

	const formatDate = useFormatDate();

	const { data: licenseData, isLoading, refetch: refetchLicense } = useLicense({ loadValues: true });
	const { isRegistered } = useRegistrationStatus();

	const { license, limits } = licenseData || {};
	const isAirgapped = license?.information?.offline;
	const licenseName = useLicenseName();

	const serverVersion = serverInfo.version;

	const { versionStatus, versions } = useMemo(() => {
		const supportedVersions = serverInfo?.supportedVersions?.signed ? decodeBase64(serverInfo?.supportedVersions?.signed) : undefined;

		if (!supportedVersions) {
			return {};
		}

		const versionStatus = getVersionStatus(serverVersion, supportedVersions?.versions);

		return {
			versionStatus,
			versions: supportedVersions?.versions,
		};
	}, [serverInfo?.supportedVersions?.signed, serverVersion]);

	const isOverLimits = limits && isOverLicenseLimits(limits);

	const actionButton:
		| undefined
		| {
				path: LocationPathname;
				label: ReactNode;
		  }
		| {
				action: () => void;
				label: ReactNode;
		  } = useMemo(() => {
		if (!isRegistered) {
			return {
				action: () => {
					const handleModalClose = (): void => {
						setModal(null);
						refetchLicense();
					};
					setModal(<RegisterWorkspaceModal onClose={handleModalClose} onStatusChange={refetchLicense} />);
				},
				label: t('RegisterWorkspace_Button'),
			};
		}

		if (versionStatus?.label === 'outdated') {
			return {
				action: () => {
					window.open(RELEASES_EXTERNAL_LINK, '_blank');
				},
				label: t('Update_version'),
			};
		}

		if (isOverLimits) {
			return { path: '/admin/subscription', label: t('Manage_subscription') };
		}
	}, [isRegistered, versionStatus, isOverLimits, t, setModal, refetchLicense]);

	const actionItems = useMemo(() => {
		return (
			[
				isOverLimits
					? {
							type: 'danger',
							icon: 'warning',
							label: t('Plan_limits_reached'),
					  }
					: {
							type: 'neutral',
							icon: 'check',
							label: t('Operating_withing_plan_limits'),
					  },
				(isAirgapped || !versions) && {
					type: 'neutral',
					icon: 'warning',
					label: (
						<Trans i18nKey='Check_support_availability'>
							Check
							<ExternalLink to={SUPPORT_EXTERNAL_LINK}>support</ExternalLink>
							availability
						</Trans>
					),
				},

				versionStatus?.label !== 'outdated' &&
					versionStatus?.expiration && {
						type: 'neutral',
						icon: 'check',
						label: (
							<Trans i18nKey='Version_supported_until' values={{ date: formatDate(versionStatus?.expiration) }}>
								Version
								<ExternalLink to={SUPPORT_EXTERNAL_LINK}>supported</ExternalLink>
								until {formatDate(versionStatus?.expiration)}
							</Trans>
						),
					},
				versionStatus?.label === 'outdated' && {
					type: 'danger',
					icon: 'warning',
					label: (
						<Trans i18nKey='Version_not_supported'>
							Version
							<ExternalLink to={SUPPORT_EXTERNAL_LINK}>not supported</ExternalLink>
						</Trans>
					),
				},
				isRegistered
					? {
							type: 'neutral',
							icon: 'check',
							label: t('Workspace_registered'),
					  }
					: {
							type: 'danger',
							icon: 'warning',
							label: t('Workspace_not_registered'),
					  },
			].filter(Boolean) as VersionActionItem[]
		).sort((a) => (a.type === 'danger' ? -1 : 1));
	}, [isOverLimits, t, isAirgapped, versions, versionStatus?.label, versionStatus?.expiration, formatDate, isRegistered]);

	return (
		<Card background={cardBackground}>
			{!isLoading && licenseData ? (
				<>
					<CardBody>
						<CardCol>
							<CardColTitle>
								<Box fontScale='h3' mbe={4} display='flex'>
									{t('Version_version', { version: serverVersion })}
									<Box mis={8} alignSelf='center' width='auto'>
										{!isAirgapped && versions && <VersionTag versionStatus={versionStatus?.label} title={versionStatus.version} />}
									</Box>
								</Box>
							</CardColTitle>

							<CardColSection m={0}>
								<Box color='secondary-info' fontScale='p2'>
									<Icon name='rocketchat' size={16} /> {licenseName.data}
								</Box>
							</CardColSection>
							{actionItems.length > 0 && (
								<CardColSection>
									<VersionCardActionItemList actionItems={actionItems} />
								</CardColSection>
							)}
						</CardCol>
					</CardBody>
					{actionButton && (
						<CardFooter>
							<VersionCardActionButton {...actionButton} />
						</CardFooter>
					)}
				</>
			) : (
				<VersionCardSkeleton />
			)}
		</Card>
	);
};

export default VersionCard;

const decodeBase64 = (b64: string): SupportedVersions | undefined => {
	const [, bodyEncoded] = b64.split('.');
	if (!bodyEncoded) {
		return;
	}

	return JSON.parse(atob(bodyEncoded));
};
