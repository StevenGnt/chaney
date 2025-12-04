import { useTranslation } from 'react-i18next';
import type { ForecastRange } from '@/lib/finance/projection';
import type { RangePreset } from '@/features/forecast/utils/range';

interface RangeSelectorProps {
	range: ForecastRange;
	presets: RangePreset[];
	activePresetId: string;
	onPresetChange: (preset: RangePreset) => void;
	onRangeChange: (range: ForecastRange) => void;
}

export function RangeSelector({
	range,
	presets,
	activePresetId,
	onPresetChange,
	onRangeChange,
}: RangeSelectorProps) {
	const { t } = useTranslation();

	const handleInputChange =
		(field: 'start' | 'end') => (event: React.ChangeEvent<HTMLInputElement>) => {
			const value = event.target.value;
			if (!value) return;

			if (field === 'start' && value > range.end) {
				onRangeChange({ start: value, end: value });
				return;
			}

			if (field === 'end' && value < range.start) {
				onRangeChange({ start: value, end: value });
				return;
			}

			onRangeChange({
				...range,
				[field]: value,
			});
		};

	return (
		<section className="rounded-2xl border border-white/10 bg-white/5 p-4">
			<header className="mb-3 flex items-center justify-between">
				<p className="text-sm font-semibold text-white">{t('FORECAST.RANGE.TITLE')}</p>
				<span className="text-xs text-slate-400">{t('FORECAST.RANGE.HINT')}</span>
			</header>
			<div className="flex flex-wrap gap-2">
				{presets.map((preset) => (
					<button
						key={preset.id}
						type="button"
						className={[
							'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition',
							activePresetId === preset.id
								? 'bg-emerald-400/90 text-emerald-950'
								: 'bg-white/10 text-white hover:bg-white/20',
						].join(' ')}
						onClick={() => {
							onPresetChange(preset);
						}}
					>
						{preset.label}
					</button>
				))}
			</div>
			<div className="mt-4 grid gap-4 sm:grid-cols-2">
				<label className="flex flex-col text-xs text-slate-300">
					{t('FORECAST.RANGE.START')}
					<input
						type="date"
						value={range.start}
						onChange={handleInputChange('start')}
						className="mt-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
					/>
				</label>
				<label className="flex flex-col text-xs text-slate-300">
					{t('FORECAST.RANGE.END')}
					<input
						type="date"
						value={range.end}
						onChange={handleInputChange('end')}
						className="mt-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
					/>
				</label>
			</div>
		</section>
	);
}
