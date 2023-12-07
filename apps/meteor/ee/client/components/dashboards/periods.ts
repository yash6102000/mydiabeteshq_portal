import type { TranslationKey } from '@rocket.chat/ui-contexts';
import moment from 'moment';

const label = (
	translationKey: TranslationKey,
	...replacements: unknown[]
): readonly [translationKey: TranslationKey, ...replacements: unknown[]] => [translationKey, ...replacements];

const lastNDays =
	(
		n: number,
	): ((utc: boolean) => {
		start: Date;
		end: Date;
	}) =>
	(utc): { start: Date; end: Date } => ({
		start: utc ? moment.utc().startOf('day').subtract(n, 'days').toDate() : moment().startOf('day').subtract(n, 'days').toDate(),
		end: utc ? moment.utc().endOf('day').toDate() : moment().endOf('day').toDate(),
	});

const periods = [
	{
		key: 'today',
		label: label('Today'),
		range: lastNDays(0),
	},
	{
		key: 'this week',
		label: label('This_week'),
		range: lastNDays(7),
	},
	{
		key: 'last 7 days',
		label: label('Last_7_days'),
		range: lastNDays(7),
	},
	{
		key: 'last 15 days',
		label: label('Last_15_days'),
		range: lastNDays(15),
	},
	{
		key: 'this month',
		label: label('This_month'),
		range: lastNDays(30),
	},
	{
		key: 'last 30 days',
		label: label('Last_30_days'),
		range: lastNDays(30),
	},
	{
		key: 'last 90 days',
		label: label('Last_90_days'),
		range: lastNDays(90),
	},
	{
		key: 'last 6 months',
		label: label('Last_6_months'),
		range: lastNDays(180),
	},
	{
		key: 'last year',
		label: label('Last_year'),
		range: lastNDays(365),
	},
] as const;

export type Period = (typeof periods)[number];

export const getPeriod = (key: (typeof periods)[number]['key']): Period => {
	const period = periods.find((period) => period.key === key);

	if (!period) {
		throw new Error(`"${key}" is not a valid period key`);
	}

	return period;
};

export const getPeriodRange = (
	key: (typeof periods)[number]['key'],
	utc = true,
): {
	start: Date;
	end: Date;
} => {
	const period = periods.find((period) => period.key === key);

	if (!period) {
		throw new Error(`"${key}" is not a valid period key`);
	}

	return period.range(utc);
};
