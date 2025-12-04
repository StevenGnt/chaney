import { format, parseISO } from 'date-fns';

const currencyFormatters = new Map<string, Intl.NumberFormat>();

/**
 * Formats a numeric value as a localized currency string.
 *
 * Reuses `Intl.NumberFormat` instances per currency for performance.
 *
 * @param value - Numeric amount to format.
 * @param currency - ISO 4217 currency code (for example, `EUR`, `USD`).
 * @returns A human-readable currency string, e.g. `"€1,234"`.
 */
export function formatCurrency(value: number, currency: string) {
	let formatter = currencyFormatters.get(currency);
	if (!formatter) {
		formatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency,
			maximumFractionDigits: 0,
		});
		currencyFormatters.set(currency, formatter);
	}

	return formatter.format(value);
}

/**
 * Formats an ISO date string into a short label using a date-fns pattern.
 *
 * @param dateISO - Date in ISO 8601 format.
 * @param pattern - Optional date-fns format pattern, defaulting to `'MMM d'`.
 * @returns A formatted date label.
 */
export function formatDateLabel(dateISO: string, pattern = 'MMM d') {
	return format(parseISO(dateISO), pattern);
}

/**
 * Formats an ISO date string into a verbose, user-friendly label.
 *
 * @param dateISO - Date in ISO 8601 format.
 * @returns A formatted date label such as `"Jan 1, 2025"`.
 */
export function formatDateVerbose(dateISO: string) {
	return formatDateLabel(dateISO, 'MMM d, yyyy');
}
