import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { ButtonsGroup } from '@/components/ButtonsGroup';
import { Section } from '@/components/Section';
import type { Account } from '@/features/ForecastWorkspace/types';
import { DEFAULT_COLOR } from '@/lib/constants';

interface AccountSelectorProps {
	accounts: Account[];
	selectedAccountIds: string[];
	onToggleAccount: (accountId: string) => void;
}

export function AccountSelector({ accounts, selectedAccountIds, onToggleAccount }: AccountSelectorProps) {
	const { t } = useTranslation();

	return (
		<Section title={t('FORECAST.ACCOUNTS.TITLE')} hint={t('FORECAST.ACCOUNTS.HINT')}>
			<ButtonsGroup>
				{accounts.map((account) => (
					<Button
						key={account.id}
						active={selectedAccountIds.includes(account.id)}
						onClick={() => {
							onToggleAccount(account.id);
						}}
					>
						<span className="flex items-center gap-2">
							<span className="h-3 w-3 rounded-full" style={{ backgroundColor: account.color ?? DEFAULT_COLOR }} />
							<span className="font-semibold">{account.name}</span>
						</span>
					</Button>
				))}
			</ButtonsGroup>
		</Section>
	);
}
