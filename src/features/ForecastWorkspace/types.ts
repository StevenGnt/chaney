import { z } from 'zod';

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use ISO date format YYYY-MM-DD');

export const currencySchema = z.enum(['EUR', 'USD', 'GBP', 'CAD']);

export const recurrenceFrequencySchema = z.enum(['weekly', 'monthly', 'yearly']);

export const dateRangeSchema = z.object({
	start: isoDateSchema,
	end: isoDateSchema.optional(),
});

export const singleScheduleSchema = z.object({
	kind: z.literal('single'),
	date: isoDateSchema,
});

export const recurringScheduleSchema = z.object({
	kind: z.literal('recurring'),
	frequency: recurrenceFrequencySchema,
	startDate: isoDateSchema,
	endDate: isoDateSchema.optional(),
	occurrences: z.number().int().positive().optional(),
	interruptions: z.array(dateRangeSchema).default([]),
});

const baseTransactionSchema = z.object({
	id: z.string(),
	label: z.string(),
	category: z.string(),
	amount: z.number(),
	taxRate: z.number().min(0).max(1).optional(),
	notes: z.string().optional(),
});

export const singleTransactionSchema = baseTransactionSchema.extend({
	schedule: singleScheduleSchema,
});

export const recurringTransactionSchema = baseTransactionSchema.extend({
	schedule: recurringScheduleSchema,
});

export const transactionSchema = z.union([singleTransactionSchema, recurringTransactionSchema]);

export const accountSchema = z.object({
	id: z.string(),
	name: z.string(),
	institution: z.string().optional(),
	currency: currencySchema,
	color: z.string().optional(),
	initialBalance: z.number(),
	initialDate: isoDateSchema,
	transactions: z.array(transactionSchema),
});

export const thresholdSchema = z.object({
	id: z.string(),
	label: z.string(),
	amount: z.number(),
	currency: currencySchema,
	color: z.string().optional(),
});

export const financeMockSchema = z.object({
	accounts: z.array(accountSchema),
	thresholds: z.array(thresholdSchema).default([]),
});

// Infer types
export type CurrencyCode = z.infer<typeof currencySchema>;
export type RecurrenceFrequency = z.infer<typeof recurrenceFrequencySchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type Account = z.infer<typeof accountSchema>;
export type FinanceMock = z.infer<typeof financeMockSchema>;
export type SingleTransaction = z.infer<typeof singleTransactionSchema>;
export type RecurringTransaction = z.infer<typeof recurringTransactionSchema>;
export type TransactionSchedule = z.infer<typeof singleScheduleSchema> | z.infer<typeof recurringScheduleSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type Threshold = z.infer<typeof thresholdSchema>;
