import type { SelectOption } from '@rocket.chat/fuselage';
import { Accordion, Field, FieldGroup, FieldLabel, FieldRow, MultiSelect } from '@rocket.chat/fuselage';
import { useUniqueId } from '@rocket.chat/fuselage-hooks';
import { useUserPreference, useTranslation } from '@rocket.chat/ui-contexts';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

const PreferencesGlobalSection = () => {
	const t = useTranslation();

	const userDontAskAgainList = useUserPreference<{ action: string; label: string }[]>('dontAskAgainList') || [];
	const options: SelectOption[] = userDontAskAgainList.map(({ action, label }) => [action, label]);

	const { control } = useFormContext();
	const dontAskAgainListId = useUniqueId();

	return (
		<Accordion.Item title={t('Global')}>
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor={dontAskAgainListId}>{t('Dont_ask_me_again_list')}</FieldLabel>
					<FieldRow>
						<Controller
							name='dontAskAgainList'
							control={control}
							render={({ field: { value, onChange } }) => (
								<MultiSelect id={dontAskAgainListId} placeholder={t('Nothing_found')} value={value} onChange={onChange} options={options} />
							)}
						/>
					</FieldRow>
				</Field>
			</FieldGroup>
		</Accordion.Item>
	);
};

export default PreferencesGlobalSection;
