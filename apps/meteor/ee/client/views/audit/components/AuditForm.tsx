import type { IAuditLog } from '@rocket.chat/core-typings';
import { Box, Field, FieldLabel, FieldRow, FieldError, TextInput, Button, ButtonGroup } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React from 'react';
import { useController } from 'react-hook-form';

import type { AuditFields } from '../hooks/useAuditForm';
import { useAuditForm } from '../hooks/useAuditForm';
import { useSendTelemetryMutation } from '../hooks/useSendTelemetryMutation';
import DateRangePicker from './forms/DateRangePicker';
import DirectTab from './tabs/DirectTab';
import OmnichannelTab from './tabs/OmnichannelTab';
import RoomsTab from './tabs/RoomsTab';
import UsersTab from './tabs/UsersTab';

type AuditFormProps = {
	type: IAuditLog['fields']['type'];
	onSubmit?: (payload: { type: IAuditLog['fields']['type'] } & AuditFields) => void;
};

const AuditForm = ({ type, onSubmit }: AuditFormProps) => {
	const t = useTranslation();

	const form = useAuditForm();
	const { control, handleSubmit, register } = form;

	const { field: dateRangeField, fieldState: dateRangeFieldState } = useController({ name: 'dateRange', control });

	const sendTelemetryMutation = useSendTelemetryMutation();

	const submit = () => {
		sendTelemetryMutation.mutate({
			params: [{ eventName: 'updateCounter', settingsId: 'Message_Auditing_Apply_Count', timestamp: Date.now() }],
		});

		onSubmit?.({ type, ...form.getValues() });
	};

	return (
		<form onSubmit={handleSubmit(submit)}>
			<Box display='flex' flexDirection='row' justifyContent='stretch' marginInline={-4}>
				<Field flexShrink={1} marginInline={4}>
					<FieldLabel>{t('Message')}</FieldLabel>
					<FieldRow>
						<TextInput placeholder={t('Search')} {...register('msg')} />
					</FieldRow>
				</Field>
				<Field flexShrink={1} marginInline={4}>
					<FieldLabel>{t('Date')}</FieldLabel>
					<FieldRow>
						<DateRangePicker value={dateRangeField.value} onChange={dateRangeField.onChange} display='flex' flexGrow={1} />
						{dateRangeFieldState.error?.type === 'required' && <FieldError>{t('The_field_is_required', t('Date'))}</FieldError>}
						{dateRangeFieldState.error?.type === 'validate' && <FieldError>{dateRangeFieldState.error.message}</FieldError>}
					</FieldRow>
				</Field>
			</Box>
			<Box display='flex' flexDirection='row' alignItems='flex-start'>
				{type === '' && <RoomsTab form={form} />}
				{type === 'u' && <UsersTab form={form} />}
				{type === 'd' && <DirectTab form={form} />}
				{type === 'l' && <OmnichannelTab form={form} />}
				<ButtonGroup align='end' flexShrink={0} marginBlockStart={28} marginInlineStart={8}>
					<Button secondary onClick={() => window.print()}>
						{t('Export')} {t('PDF')}
					</Button>
					<Button primary type='submit'>
						{t('Apply')}
					</Button>
				</ButtonGroup>
			</Box>
		</form>
	);
};

export default AuditForm;
