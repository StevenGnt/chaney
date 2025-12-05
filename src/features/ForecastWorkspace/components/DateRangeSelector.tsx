import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { addMonths, differenceInMonths, formatISO, parseISO } from 'date-fns';
import type { ForecastRange } from '@/lib/finance/projection';
import type { DateRangePreset } from '@/features/ForecastWorkspace/utils/range';
import { Section } from '@/components/Section';
import { Button } from '@/components/Button';
import { ButtonsGroup } from '@/components/ButtonsGroup';

interface DateRangeSelectorProps {
	dateRange: ForecastRange;
	presets: DateRangePreset[];
	onDateRangeChange: (dateRange: ForecastRange) => void;
}

interface DateRangeSelectorDateInputProps {
	label: string;
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function DateRangeSelectorDateInput({ label, value, onChange }: DateRangeSelectorDateInputProps) {
	return (
		<label className="flex flex-col text-xs text-slate-300">
			{label}
			<input
				className="mt-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
				type="date"
				value={value}
				onChange={onChange}
			/>
		</label>
	);
}

export function DateRangeSelector({ dateRange, presets, onDateRangeChange }: DateRangeSelectorProps) {
	const { t } = useTranslation();

	// Calculate the active preset ID based on the current date range
	const activePresetId = useMemo(() => {
		const startDate = parseISO(dateRange.start);
		const endDate = parseISO(dateRange.end);
		const monthsInRange = Math.max(1, differenceInMonths(endDate, startDate));
		const matchingPreset = presets.find((preset) => preset.months === monthsInRange);

		if (matchingPreset) {
			// Check if the date range matches the preset (same start date and months)
			const expectedEnd = formatISO(addMonths(startDate, matchingPreset.months), { representation: 'date' });
			if (expectedEnd === dateRange.end) {
				return matchingPreset.id;
			}
		}

		return null;
	}, [dateRange, presets]);

	const handlePresetClick = (preset: DateRangePreset) => {
		const startDate = parseISO(dateRange.start);
		const endDate = addMonths(startDate, preset.months);
		onDateRangeChange({
			start: dateRange.start,
			end: formatISO(endDate, { representation: 'date' }),
		});
	};

	const handleInputChange = (field: 'start' | 'end') => (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;

		if (value) {
			const newRange =
				// If start date is after end date, set both to the new
				(field === 'start' && value > dateRange.end) || (field === 'end' && value < dateRange.start)
					? { start: value, end: value }
					: { ...dateRange, [field]: value };

			onDateRangeChange(newRange);
		}
	};

	return (
		<Section title={t('FORECAST.RANGE.TITLE')} hint={t('FORECAST.RANGE.HINT')}>
			<ButtonsGroup>
				{presets.map((preset) => (
					<Button
						key={preset.id}
						active={activePresetId === preset.id}
						onClick={() => {
							handlePresetClick(preset);
						}}
					>
						{preset.label}
					</Button>
				))}
			</ButtonsGroup>

			<div className="mt-4 grid gap-4 sm:grid-cols-2">
				<DateRangeSelectorDateInput
					label={t('FORECAST.RANGE.START')}
					value={dateRange.start}
					onChange={handleInputChange('start')}
				/>
				<DateRangeSelectorDateInput
					label={t('FORECAST.RANGE.END')}
					value={dateRange.end}
					onChange={handleInputChange('end')}
				/>
			</div>
		</Section>
	);
}
