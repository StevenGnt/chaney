import { useTranslation } from 'react-i18next';
import type { ForecastRange } from '@/lib/finance/projection';
import type { DateRangePreset } from '@/features/ForecastWorkspace/utils/range';
import { Section } from '@/components/Section';
import { Button } from '@/components/Button';
import { ButtonsGroup } from '@/components/ButtonsGroup';

interface DateRangeSelectorProps {
	dateRange: ForecastRange;
	presets: DateRangePreset[];
	activePresetId: string;
	onPresetChange: (preset: DateRangePreset) => void;
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

export function DateRangeSelector({
	dateRange,
	presets,
	activePresetId,
	onPresetChange,
	onDateRangeChange,
}: DateRangeSelectorProps) {
	const { t } = useTranslation();

	const handleInputChange = (field: 'start' | 'end') => (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;

		if (value) {
			// If new start date is after end date, set both to the new start date
			if (field === 'start' && value > dateRange.end) {
				onDateRangeChange({ start: value, end: value });
			}
			// If new end date is before start date, set both to the new end date
			else if (field === 'end' && value < dateRange.start) {
				onDateRangeChange({ start: value, end: value });
			}
			// Otherwise, update only the changed field
			else {
				onDateRangeChange({ ...dateRange, [field]: value });
			}
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
							onPresetChange(preset);
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
