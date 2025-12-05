import { useTranslation } from 'react-i18next';
import type { Account } from '@/features/ForecastWorkspace/types';
import { AccountToggleList } from '@/features/ForecastWorkspace/components/AccountToggleList';
import { Section } from '@/components/Section';

interface AccountSectionProps {
	accounts: Account[];
	selectedAccountIds: string[];
	onToggleAccount: (accountId: string) => void;
	summaries: Record<string, { endBalance: number; delta: number }>;
}

export function AccountSection({ accounts, selectedAccountIds, onToggleAccount, summaries }: AccountSectionProps) {
	const { t } = useTranslation();

	return (
		<Section title={t('FORECAST.ACCOUNTS.TITLE')} hint={t('FORECAST.ACCOUNTS.HINT')}>
			<AccountToggleList
				accounts={accounts}
				selectedIds={selectedAccountIds}
				onToggle={onToggleAccount}
				summaries={summaries}
			/>
		</Section>
	);
}
