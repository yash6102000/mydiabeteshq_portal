import { Field, FieldLabel, FieldRow, FieldError } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useController } from 'react-hook-form';

import AutoCompleteAgent from '../../../../../../client/components/AutoCompleteAgent';
import type { AuditFields } from '../../hooks/useAuditForm';
import VisitorAutoComplete from '../forms/VisitorAutoComplete';

type OmnichannelTabProps = {
	form: UseFormReturn<AuditFields>;
};

const OmnichannelTab = ({ form: { control } }: OmnichannelTabProps): ReactElement => {
	const t = useTranslation();

	const { field: visitorField, fieldState: visitorFieldState } = useController({
		name: 'visitor',
		control,
		rules: { required: true },
	});
	const { field: agentField, fieldState: agentFieldState } = useController({
		name: 'agent',
		control,
		rules: { required: true },
	});

	return (
		<>
			<Field flexShrink={1}>
				<FieldLabel flexGrow={0}>{t('Visitor')}</FieldLabel>
				<FieldRow>
					<VisitorAutoComplete
						value={visitorField.value}
						error={!!visitorFieldState.error}
						onChange={visitorField.onChange}
						placeholder={t('Username_Placeholder')}
					/>
				</FieldRow>
				{visitorFieldState.error?.type === 'required' && <FieldError>{t('The_field_is_required', t('Visitor'))}</FieldError>}
				{visitorFieldState.error?.type === 'validate' && <FieldError>{visitorFieldState.error.message}</FieldError>}
			</Field>
			<Field flexShrink={1} marginInlineStart={8}>
				<FieldLabel flexGrow={0}>{t('Agent')}</FieldLabel>
				<FieldRow>
					<AutoCompleteAgent
						error={(() => {
							if (agentFieldState.error?.type === 'required') {
								return t('The_field_is_required', t('Agent'));
							}

							return agentFieldState.error?.message;
						})()}
						value={agentField.value}
						onChange={agentField.onChange}
						placeholder={t('Username_Placeholder')}
					/>
				</FieldRow>
				{agentFieldState.error?.type === 'required' && <FieldError>{t('The_field_is_required', t('Agent'))}</FieldError>}
				{agentFieldState.error?.type === 'validate' && <FieldError>{agentFieldState.error.message}</FieldError>}
			</Field>
		</>
	);
};

export default OmnichannelTab;
