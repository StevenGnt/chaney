import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { ButtonsGroup } from '@/components/ButtonsGroup';
import { Section } from '@/components/Section';
import type { DateRangePreset } from '@/features/ForecastWorkspace/utils/range';

interface DateRangeSelectorProps {
	duration: number;
	presets: DateRangePreset[];
	onDurationChange: (duration: number) => void;
}

export function DateRangeSelector({ duration, presets, onDurationChange }: DateRangeSelectorProps) {
	const { t } = useTranslation();

	const handlePresetClick = (preset: DateRangePreset) => {
		onDurationChange(preset.months);
	};

	return (
		<Section title={t('FORECAST.RANGE.TITLE')} hint={t('FORECAST.RANGE.HINT')}>
			<ButtonsGroup>
				{presets.map((preset) => (
					<Button
						key={preset.id}
						active={duration === preset.months}
						onClick={() => {
							handlePresetClick(preset);
						}}
					>
						{preset.label}
					</Button>
				))}
			</ButtonsGroup>
		</Section>
	);
}
