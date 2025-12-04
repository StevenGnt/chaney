import { addMonths, addWeeks, addYears, formatISO, parseISO } from 'date-fns';
import type { Account, DateRange, Transaction } from '@/features/forecast/types';

export interface ForecastRange extends DateRange {
	end: string;
}

export interface BalancePoint {
	date: string;
	balance: number;
}

export interface AccountProjection {
	accountId: string;
	points: BalancePoint[];
}

interface TransactionEvent {
	timestamp: number;
	date: string;
	amount: number;
}

const ISO_OPTIONS = { representation: 'date' } as const;

export function projectAccountBalance(account: Account, range: ForecastRange): AccountProjection {
	const accountStart = parseISO(account.initialDate);
	const forecastStart = parseISO(range.start);
	const forecastEnd = parseISO(range.end);
	const effectiveStart = accountStart > forecastStart ? accountStart : forecastStart;

	const events = buildTransactionEvents(account, {
		start: account.initialDate,
		end: range.end,
	});

	let cursor = 0;
	let balance = account.initialBalance;

	while (cursor < events.length && events[cursor].timestamp < effectiveStart.getTime()) {
		balance += events[cursor].amount;
		cursor += 1;
	}

	const points: BalancePoint[] = [
		{
			date: formatISO(effectiveStart, ISO_OPTIONS),
			balance,
		},
	];

	for (; cursor < events.length; cursor += 1) {
		const event = events[cursor];
		if (event.timestamp > forecastEnd.getTime()) {
			break;
		}

		balance += event.amount;

		upsertPoint(points, event.date, balance);
	}

	const finalDate = formatISO(forecastEnd, ISO_OPTIONS);
	if (points[points.length - 1]?.date !== finalDate) {
		points.push({ date: finalDate, balance });
	}

	return {
		accountId: account.id,
		points,
	};
}

export function projectAccounts(accounts: Account[], range: ForecastRange): AccountProjection[] {
	return accounts.map((account) => projectAccountBalance(account, range));
}

function buildTransactionEvents(account: Account, window: ForecastRange): TransactionEvent[] {
	const rangeStart = parseISO(window.start);
	const rangeEnd = parseISO(window.end);
	const events: TransactionEvent[] = [];

	for (const transaction of account.transactions) {
		const signedAmount = normalizeAmount(transaction);
		if (signedAmount === 0) continue;

		if (transaction.schedule.kind === 'single') {
			const occurrence = parseISO(transaction.schedule.date);
			if (occurrence >= rangeStart && occurrence <= rangeEnd && occurrence >= parseISO(account.initialDate)) {
				events.push(createEvent(occurrence, signedAmount));
			}
			continue;
		}

		const occurrences = expandRecurringSchedule(transaction, account.initialDate, window);

		for (const occurrence of occurrences) {
			events.push(createEvent(occurrence, signedAmount));
		}
	}

	return events.sort((left, right) => left.timestamp - right.timestamp);
}

function normalizeAmount(transaction: Transaction) {
	const base = transaction.type === 'income' ? transaction.amount : -1 * transaction.amount;

	if (transaction.type === 'income' && transaction.taxRate) {
		return +(base * (1 - transaction.taxRate)).toFixed(2);
	}

	return base;
}

function createEvent(date: Date, amount: number): TransactionEvent {
	return {
		timestamp: date.getTime(),
		date: formatISO(date, ISO_OPTIONS),
		amount,
	};
}

function expandRecurringSchedule(transaction: Transaction, accountStartISO: string, window: ForecastRange) {
	const schedule = transaction.schedule;
	if (schedule.kind !== 'recurring') {
		return [];
	}

	const every = schedule.every;
	const accountStart = parseISO(accountStartISO);
	const scheduleStart = parseISO(schedule.startDate);
	const startDate = accountStart > scheduleStart ? accountStart : scheduleStart;
	const windowStart = parseISO(window.start);
	const windowEnd = parseISO(window.end);
	const scheduleEnd = schedule.endDate ? parseISO(schedule.endDate) : windowEnd;
	const maxEnd = scheduleEnd < windowEnd ? scheduleEnd : windowEnd;

	if (startDate > maxEnd) {
		return [];
	}

	const interruptions = schedule.interruptions.map((period) => ({
		start: parseISO(period.start),
		end: period.end ? parseISO(period.end) : windowEnd,
	}));

	const dates: Date[] = [];
	let occurrences = 0;
	let cursor = startDate;

	while (cursor <= maxEnd) {
		if (!isInterrupted(cursor, interruptions)) {
			const inWindow = cursor >= windowStart && cursor <= windowEnd;
			if (inWindow) {
				dates.push(new Date(cursor));
			}
		}

		occurrences += 1;
		if (schedule.occurrences && occurrences >= schedule.occurrences) {
			break;
		}

		cursor = advanceDate(cursor, schedule.frequency, every);
	}

	return dates;
}

function advanceDate(date: Date, frequency: 'weekly' | 'monthly' | 'yearly', every: number) {
	switch (frequency) {
		case 'weekly':
			return addWeeks(date, every);
		case 'monthly':
			return addMonths(date, every);
		case 'yearly':
			return addYears(date, every);
		default:
			return date;
	}
}

function isInterrupted(date: Date, windows: { start: Date; end: Date }[]) {
	return windows.some((window) => date >= window.start && date <= window.end);
}

function upsertPoint(points: BalancePoint[], date: string, balance: number) {
	const last = points[points.length - 1];
	if (last.date === date) {
		last.balance = balance;
		return;
	}

	points.push({ date, balance });
}
