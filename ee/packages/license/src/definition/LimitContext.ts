import type { IUser } from '@rocket.chat/core-typings';

import type { LicenseLimitKind } from './ILicenseV3';

export type LimitContext<T extends LicenseLimitKind> = { extraCount?: number } & (T extends 'roomsPerGuest'
	? { userId: IUser['_id'] }
	: Record<string, never>);
