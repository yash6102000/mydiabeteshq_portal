import type { ILivechatAgent, ILivechatDepartment, ILivechatDepartmentAgents } from '@rocket.chat/core-typings';
import {
	Field,
	FieldLabel,
	FieldGroup,
	FieldRow,
	TextInput,
	Button,
	Box,
	MultiSelect,
	Icon,
	Select,
	ContextualbarFooter,
	ButtonGroup,
} from '@rocket.chat/fuselage';
import type { SelectOption } from '@rocket.chat/fuselage';
import { useMutableCallback, useUniqueId } from '@rocket.chat/fuselage-hooks';
import { useToastMessageDispatch, useSetting, useMethod, useTranslation, useEndpoint, useRouter } from '@rocket.chat/ui-contexts';
import { useQueryClient } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';

import { getUserEmailAddress } from '../../../../lib/getUserEmailAddress';
import {
	Contextualbar,
	ContextualbarTitle,
	ContextualbarClose,
	ContextualbarHeader,
	ContextualbarScrollableContent,
} from '../../../components/Contextualbar';
import UserInfo from '../../../components/UserInfo';
import { MaxChatsPerAgent } from '../additionalForms';

type AgentEditProps = {
	agentData: Pick<ILivechatAgent, '_id' | 'username' | 'name' | 'status' | 'statusLivechat' | 'emails' | 'livechat'>;
	userDepartments: Pick<ILivechatDepartmentAgents, 'departmentId'>[];
	availableDepartments: Pick<ILivechatDepartment, '_id' | 'name' | 'archived'>[];
};

const AgentEdit = ({ agentData, userDepartments, availableDepartments }: AgentEditProps) => {
	const t = useTranslation();
	const router = useRouter();
	const queryClient = useQueryClient();

	const voipEnabled = useSetting('VoIP_Enabled');
	const dispatchToastMessage = useToastMessageDispatch();

	const { name, username, livechat, statusLivechat } = agentData;

	const email = getUserEmailAddress(agentData);

	const departmentsOptions: SelectOption[] = useMemo(() => {
		const archivedDepartment = (name: string, archived?: boolean) => (archived ? `${name} [${t('Archived')}]` : name);

		return (
			availableDepartments.map(({ _id, name, archived }) =>
				name ? [_id, archivedDepartment(name, archived)] : [_id, archivedDepartment(_id, archived)],
			) || []
		);
	}, [availableDepartments, t]);

	const statusOptions: SelectOption[] = useMemo(
		() => [
			['available', t('Available')],
			['not-available', t('Not_Available')],
		],
		[t],
	);

	const initialDepartmentValue = useMemo(() => userDepartments.map(({ departmentId }) => departmentId) || [], [userDepartments]);

	const methods = useForm({
		values: {
			name,
			username,
			email,
			departments: initialDepartmentValue,
			status: statusLivechat,
			maxNumberSimultaneousChat: livechat?.maxNumberSimultaneousChat || 0,
			voipExtension: '',
		},
	});

	const {
		control,
		handleSubmit,
		reset,
		formState: { isDirty },
	} = methods;

	const saveAgentInfo = useMethod('livechat:saveAgentInfo');
	const saveAgentStatus = useEndpoint('POST', '/v1/livechat/agent.status');

	const handleSave = useMutableCallback(async ({ status, departments, ...data }) => {
		try {
			await saveAgentStatus({ agentId: agentData._id, status });
			await saveAgentInfo(agentData._id, data, departments);
			dispatchToastMessage({ type: 'success', message: t('Success') });
			router.navigate('/omnichannel/agents');
			queryClient.invalidateQueries(['livechat-agents']);
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	});

	const formId = useUniqueId();
	const nameField = useUniqueId();
	const usernameField = useUniqueId();
	const emailField = useUniqueId();
	const departmentsField = useUniqueId();
	const statusField = useUniqueId();
	const voipExtensionField = useUniqueId();

	return (
		<Contextualbar>
			<ContextualbarHeader>
				<ContextualbarTitle>{t('Edit_User')}</ContextualbarTitle>
				<ContextualbarClose onClick={() => router.navigate('/omnichannel/agents')} />
			</ContextualbarHeader>
			<ContextualbarScrollableContent>
				<FormProvider {...methods}>
					<form id={formId} onSubmit={handleSubmit(handleSave)}>
						{username && (
							<Box display='flex' flexDirection='column' alignItems='center'>
								<UserInfo.Avatar data-qa='AgentEdit-Avatar' username={username} />
							</Box>
						)}
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor={nameField}>{t('Name')}</FieldLabel>
								<FieldRow>
									<Controller
										name='name'
										control={control}
										render={({ field }) => <TextInput id={nameField} data-qa='AgentEditTextInput-Name' {...field} readOnly />}
									/>
								</FieldRow>
							</Field>
							<Field>
								<FieldLabel htmlFor={usernameField}>{t('Username')}</FieldLabel>
								<FieldRow>
									<Controller
										name='username'
										control={control}
										render={({ field }) => (
											<TextInput
												id={usernameField}
												data-qa='AgentEditTextInput-Username'
												{...field}
												readOnly
												addon={<Icon name='at' size='x20' />}
											/>
										)}
									/>
								</FieldRow>
							</Field>
							<Field>
								<FieldLabel htmlFor={emailField}>{t('Email')}</FieldLabel>
								<FieldRow>
									<Controller
										name='email'
										control={control}
										render={({ field }) => (
											<TextInput
												id={emailField}
												data-qa='AgentEditTextInput-Email'
												{...field}
												readOnly
												addon={<Icon name='mail' size='x20' />}
											/>
										)}
									/>
								</FieldRow>
							</Field>
							<Field>
								<FieldLabel htmlFor={departmentsField}>{t('Departments')}</FieldLabel>
								<FieldRow>
									<Controller
										name='departments'
										control={control}
										render={({ field }) => (
											<MultiSelect
												id={departmentsField}
												data-qa='AgentEditTextInput-Departaments'
												options={departmentsOptions}
												{...field}
												placeholder={t('Select_an_option')}
											/>
										)}
									/>
								</FieldRow>
							</Field>
							<Field>
								<FieldLabel htmlFor={statusField}>{t('Status')}</FieldLabel>
								<FieldRow>
									<Controller
										name='status'
										control={control}
										render={({ field }) => (
											<Select
												id={statusField}
												data-qa='AgentEditTextInput-Status'
												{...field}
												options={statusOptions}
												placeholder={t('Select_an_option')}
											/>
										)}
									/>
								</FieldRow>
							</Field>
							{MaxChatsPerAgent && <MaxChatsPerAgent />}
							{voipEnabled && (
								<Field>
									<FieldLabel htmlFor={voipExtensionField}>{t('VoIP_Extension')}</FieldLabel>
									<FieldRow>
										<Controller
											name='voipExtension'
											control={control}
											render={({ field }) => <TextInput id={voipExtensionField} {...field} data-qa='AgentEditTextInput-VoIP_Extension' />}
										/>
									</FieldRow>
								</Field>
							)}
						</FieldGroup>
					</form>
				</FormProvider>
			</ContextualbarScrollableContent>
			<ContextualbarFooter>
				<ButtonGroup stretch>
					<Button data-qa='AgentEditButtonReset' type='reset' disabled={!isDirty} onClick={() => reset()}>
						{t('Reset')}
					</Button>
					<Button form={formId} primary type='submit' data-qa='AgentEditButtonSave' disabled={!isDirty}>
						{t('Save')}
					</Button>
				</ButtonGroup>
			</ContextualbarFooter>
		</Contextualbar>
	);
};

export default AgentEdit;
