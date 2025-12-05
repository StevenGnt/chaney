import { useTranslation } from 'react-i18next';
import type { ForecastRange } from '@/lib/finance/projection';
import type { RangePreset } from '@/features/ForecastWorkspace/utils/range';
import { Section } from '@/components/Section';
import { Button } from '@/components/Button';
import { ButtonsGroup } from '@/components/ButtonsGroup';

interface RangeSelectorProps {
	range: ForecastRange;
	presets: RangePreset[];
	activePresetId: string;
	onPresetChange: (preset: RangePreset) => void;
	onRangeChange: (range: ForecastRange) => void;
}

interface RangeSelectorDateInputProps {
	label: string;
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function RangeSelectorDateInput({ label, value, onChange }: RangeSelectorDateInputProps) {
	return (
		<label className="flex flex-col text-xs text-slate-300">
			{label}
			<input
				className="mt-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
				type="date"
				value={value}
				onChange={onChange}
			/>
		</label>
	);
}

export function RangeSelector({ range, presets, activePresetId, onPresetChange, onRangeChange }: RangeSelectorProps) {
	const { t } = useTranslation();

	/**
	 * Creates a change handler for date inputs that validates and updates the range.
	 *
	 * If the new date would create an invalid range (start > end or end < start),
	 * it adjusts both dates to the new value to maintain validity.
	 *
	 * @param field - Which date field is being changed ('start' or 'end').
	 * @returns An event handler function for the date input.
	 */
	const handleInputChange = (field: 'start' | 'end') => (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;

		if (value) {
			// If new start date is after end date, set both to the new start date
			if (field === 'start' && value > range.end) {
				onRangeChange({ start: value, end: value });
			}
			// If new end date is before start date, set both to the new end date
			else if (field === 'end' && value < range.start) {
				onRangeChange({ start: value, end: value });
			}
			// Otherwise, update only the changed field
			else {
				onRangeChange({ ...range, [field]: value });
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
				<RangeSelectorDateInput
					label={t('FORECAST.RANGE.START')}
					value={range.start}
					onChange={handleInputChange('start')}
				/>
				<RangeSelectorDateInput label={t('FORECAST.RANGE.END')} value={range.end} onChange={handleInputChange('end')} />
			</div>
		</Section>
	);
}
