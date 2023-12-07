import { Button, Box, Field, FieldLabel, FieldRow } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useState } from 'react';

import UserAutoComplete from '../../../../components/UserAutoComplete';
import { useEndpointAction } from '../../../../hooks/useEndpointAction';

type AddAgentProps = {
	reload: () => void;
};

const AddAgent = ({ reload }: AddAgentProps): ReactElement => {
	const t = useTranslation();
	const [username, setUsername] = useState('');
	const dispatchToastMessage = useToastMessageDispatch();

	const saveAction = useEndpointAction('POST', '/v1/livechat/users/agent');

	const handleSave = useMutableCallback(async () => {
		try {
			await saveAction({ username });
			reload();
			setUsername('');
			dispatchToastMessage({ type: 'success', message: t('Agent_added') });
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	});

	const handleChange = (value: unknown): void => {
		if (typeof value === 'string') {
			setUsername(value);
		}
	};

	return (
		<Box display='flex' alignItems='center'>
			<Field>
				<FieldLabel>{t('Username')}</FieldLabel>
				<FieldRow>
					<UserAutoComplete value={username} onChange={handleChange} />
					<Button disabled={!username} onClick={handleSave} mis={8} primary>
						{t('Add_agent')}
					</Button>
				</FieldRow>
			</Field>
		</Box>
	);
};

export default AddAgent;
