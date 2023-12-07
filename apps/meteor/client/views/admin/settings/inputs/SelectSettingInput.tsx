import { Box, FieldLabel, FieldRow, Flex, Select } from '@rocket.chat/fuselage';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import ResetSettingButton from '../ResetSettingButton';

type SelectSettingInputProps = {
	_id: string;
	label: string;
	value?: string;
	values?: { key: string; i18nLabel: TranslationKey }[];
	placeholder?: string;
	readonly?: boolean;
	autocomplete?: boolean;
	disabled?: boolean;
	hasResetButton?: boolean;
	onChangeValue?: (value: string) => void;
	onResetButtonClick?: () => void;
};

function SelectSettingInput({
	_id,
	label,
	value,
	placeholder,
	readonly,
	autocomplete,
	disabled,
	values = [],
	hasResetButton,
	onChangeValue,
	onResetButtonClick,
}: SelectSettingInputProps): ReactElement {
	const t = useTranslation();

	const handleChange = (value: string): void => {
		onChangeValue?.(value);
	};

	return (
		<>
			<Flex.Container>
				<Box>
					<FieldLabel htmlFor={_id} title={_id}>
						{label}
					</FieldLabel>
					{hasResetButton && <ResetSettingButton data-qa-reset-setting-id={_id} onClick={onResetButtonClick} />}
				</Box>
			</Flex.Container>
			<FieldRow>
				<Select
					data-qa-setting-id={_id}
					id={_id}
					value={value}
					placeholder={placeholder}
					disabled={disabled}
					readOnly={readonly}
					autoComplete={autocomplete === false ? 'off' : undefined}
					onChange={(value) => handleChange(String(value))}
					options={values.map(({ key, i18nLabel }) => [key, t(i18nLabel)])}
				/>
			</FieldRow>
		</>
	);
}

export default SelectSettingInput;
