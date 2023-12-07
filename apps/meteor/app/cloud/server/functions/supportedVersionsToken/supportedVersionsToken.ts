import type { SettingValue } from '@rocket.chat/core-typings';
import { License } from '@rocket.chat/license';
import { Settings } from '@rocket.chat/models';
import type { SignedSupportedVersions, SupportedVersions } from '@rocket.chat/server-cloud-communication';
import type { Response } from '@rocket.chat/server-fetch';
import { serverFetch as fetch } from '@rocket.chat/server-fetch';

import { SystemLogger } from '../../../../../server/lib/logger/system';
import { settings } from '../../../../settings/server';
import { supportedVersions as supportedVersionsFromBuild } from '../../../../utils/rocketchat-supported-versions.info';
import { buildVersionUpdateMessage } from '../../../../version-check/server/functions/buildVersionUpdateMessage';
import { generateWorkspaceBearerHttpHeader } from '../getWorkspaceAccessToken';
import { supportedVersionsChooseLatest } from './supportedVersionsChooseLatest';

declare module '@rocket.chat/license' {
	interface ILicenseV3 {
		supportedVersions?: SignedSupportedVersions;
	}
}

/** HELPERS */

export const wrapPromise = <T>(
	promise: Promise<T>,
): Promise<
	| {
			success: true;
			result: T;
	  }
	| {
			success: false;
			error: any;
	  }
> =>
	promise
		.then((result) => ({ success: true, result } as const))
		.catch((error) => ({
			success: false,
			error,
		}));

export const handleResponse = async <T>(promise: Promise<Response>) => {
	return wrapPromise<T>(
		(async () => {
			const request = await promise;
			if (!request.ok) {
				if (request.size > 0) {
					throw new Error((await request.json()).error);
				}
				throw new Error(request.statusText);
			}

			return request.json();
		})(),
	);
};

const cacheValueInSettings = <T extends SettingValue>(
	key: string,
	fn: () => Promise<T>,
): (() => Promise<T>) & {
	reset: () => Promise<T>;
} => {
	const reset = async () => {
		const value = await fn();

		await Settings.updateValueById(key, value);

		return value;
	};

	return Object.assign(
		async () => {
			const storedValue = settings.get<T>(key);

			if (storedValue) {
				return storedValue;
			}

			return reset();
		},
		{
			reset,
		},
	);
};

const releaseEndpoint = process.env.OVERWRITE_INTERNAL_RELEASE_URL?.trim()
	? process.env.OVERWRITE_INTERNAL_RELEASE_URL.trim()
	: 'https://releases.rocket.chat/v2/server/supportedVersions';

const getSupportedVersionsFromCloud = async () => {
	if (process.env.CLOUD_SUPPORTED_VERSIONS_TOKEN) {
		return {
			success: true,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			result: JSON.parse(process.env.CLOUD_SUPPORTED_VERSIONS!),
		};
	}

	const headers = await generateWorkspaceBearerHttpHeader();

	const response = await handleResponse<SupportedVersions>(
		fetch(releaseEndpoint, {
			headers,
			timeout: 3000,
		}),
	);

	if (!response.success) {
		SystemLogger.error({
			msg: 'Failed to communicate with Rocket.Chat Cloud',
			url: releaseEndpoint,
			err: response.error,
		});
	}

	return response;
};

const getSupportedVersionsToken = async () => {
	/**
	 * Gets the supported versions from the license
	 * Gets the supported versions from the cloud
	 * Gets the latest version
	 * return the token
	 */

	const [versionsFromLicense, response] = await Promise.all([License.getLicense(), getSupportedVersionsFromCloud()]);

	const supportedVersions = await supportedVersionsChooseLatest(
		supportedVersionsFromBuild,
		versionsFromLicense?.supportedVersions,
		(response.success && response.result) || undefined,
	);

	await buildVersionUpdateMessage(supportedVersions?.versions);

	return supportedVersions?.signed;
};

export const getCachedSupportedVersionsToken = cacheValueInSettings('Cloud_Workspace_Supported_Versions_Token', getSupportedVersionsToken);
