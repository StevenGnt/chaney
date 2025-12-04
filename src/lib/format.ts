import { format, parseISO } from 'date-fns';

const currencyFormatters = new Map<string, Intl.NumberFormat>();

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

export function formatDateLabel(dateISO: string, pattern = 'MMM d') {
	return format(parseISO(dateISO), pattern);
}

export function formatDateVerbose(dateISO: string) {
	return formatDateLabel(dateISO, 'MMM d, yyyy');
}
