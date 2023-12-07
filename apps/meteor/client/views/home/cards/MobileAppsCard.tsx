import { Button } from '@rocket.chat/fuselage';
import { Card, CardTitle, CardBody, CardFooterWrapper, CardFooter } from '@rocket.chat/ui-client';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import { useExternalLink } from '../../../hooks/useExternalLink';

const GOOGLE_PLAY_URL = 'https://go.rocket.chat/i/hp-mobile-app-google';
const APP_STORE_URL = 'https://go.rocket.chat/i/hp-mobile-app-apple';

const MobileAppsCard = (): ReactElement => {
	const t = useTranslation();
	const handleOpenLink = useExternalLink();

	return (
		<Card data-qa-id='homepage-mobile-apps-card'>
			<CardTitle>{t('Mobile_apps')}</CardTitle>
			<CardBody>{t('Take_rocket_chat_with_you_with_mobile_applications')}</CardBody>
			<CardFooterWrapper>
				<CardFooter>
					<Button onClick={() => handleOpenLink(GOOGLE_PLAY_URL)}>{t('Google_Play')}</Button>
					<Button onClick={() => handleOpenLink(APP_STORE_URL)}>{t('App_Store')}</Button>
				</CardFooter>
			</CardFooterWrapper>
		</Card>
	);
};

export default MobileAppsCard;
