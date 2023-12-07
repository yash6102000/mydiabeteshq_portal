import { Field, FieldLabel, FieldRow, ButtonGroup, Button, CheckBox, Callout } from '@rocket.chat/fuselage';
import { useUniqueId } from '@rocket.chat/fuselage-hooks';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import {
	ContextualbarHeader,
	ContextualbarIcon,
	ContextualbarTitle,
	ContextualbarScrollableContent,
	ContextualbarFooter,
	ContextualbarClose,
} from '../../../../components/Contextualbar';
import UserAutoCompleteMultiple from '../../../../components/UserAutoCompleteMultiple';
import PruneMessagesDateTimeRow from './PruneMessagesDateTimeRow';

type PruneMessagesProps = {
	callOutText?: string;
	validateText?: string;
	users: string[];
	onClickClose: () => void;
	onClickPrune: () => void;
};

const PruneMessages = ({ callOutText, validateText, onClickClose, onClickPrune }: PruneMessagesProps): ReactElement => {
	const t = useTranslation();
	const { control, register } = useFormContext();

	const inclusiveCheckboxId = useUniqueId();
	const pinnedCheckboxId = useUniqueId();
	const discussionCheckboxId = useUniqueId();
	const threadsCheckboxId = useUniqueId();
	const attachedCheckboxId = useUniqueId();

	return (
		<>
			<ContextualbarHeader>
				<ContextualbarIcon name='eraser' />
				<ContextualbarTitle>{t('Prune_Messages')}</ContextualbarTitle>
				{onClickClose && <ContextualbarClose onClick={onClickClose} />}
			</ContextualbarHeader>
			<ContextualbarScrollableContent>
				<PruneMessagesDateTimeRow label={t('Newer_than')} field='newer' />
				<PruneMessagesDateTimeRow label={t('Older_than')} field='older' />
				<Field>
					<FieldLabel flexGrow={0}>{t('Only_from_users')}</FieldLabel>
					<Controller
						control={control}
						name='users'
						render={({ field: { onChange, value } }) => (
							<UserAutoCompleteMultiple value={value} onChange={onChange} placeholder={t('Please_enter_usernames')} />
						)}
					/>
				</Field>
				<Field>
					<FieldRow>
						<CheckBox id={inclusiveCheckboxId} {...register('inclusive')} />
						<FieldLabel htmlFor={inclusiveCheckboxId}>{t('Inclusive')}</FieldLabel>
					</FieldRow>
				</Field>
				<Field>
					<FieldRow>
						<CheckBox id={pinnedCheckboxId} {...register('pinned')} />
						<FieldLabel htmlFor={pinnedCheckboxId}>{t('RetentionPolicy_DoNotPrunePinned')}</FieldLabel>
					</FieldRow>
				</Field>
				<Field>
					<FieldRow>
						<CheckBox id={discussionCheckboxId} {...register('discussion')} />
						<FieldLabel htmlFor={discussionCheckboxId}>{t('RetentionPolicy_DoNotPruneDiscussion')}</FieldLabel>
					</FieldRow>
				</Field>
				<Field>
					<FieldRow>
						<CheckBox id={threadsCheckboxId} {...register('threads')} />
						<FieldLabel htmlFor={threadsCheckboxId}>{t('RetentionPolicy_DoNotPruneThreads')}</FieldLabel>
					</FieldRow>
				</Field>
				<Field>
					<FieldRow>
						<CheckBox id={attachedCheckboxId} {...register('attached')} />
						<FieldLabel htmlFor={attachedCheckboxId}>{t('Files_only')}</FieldLabel>
					</FieldRow>
				</Field>
				{callOutText && !validateText && <Callout type='warning'>{callOutText}</Callout>}
				{validateText && <Callout type='warning'>{validateText}</Callout>}
			</ContextualbarScrollableContent>
			<ContextualbarFooter>
				<ButtonGroup stretch>
					<Button danger disabled={Boolean(validateText)} onClick={onClickPrune}>
						{t('Prune')}
					</Button>
				</ButtonGroup>
			</ContextualbarFooter>
		</>
	);
};

export default PruneMessages;
