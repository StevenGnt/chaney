import { Button } from '@/components/Button';
import { ButtonsGroup } from '@/components/ButtonsGroup';
import type { Account } from '@/features/ForecastWorkspace/types';
import { formatCurrency } from '@/lib/format';

interface AccountSummary {
	endBalance: number;
	delta: number;
}

interface AccountToggleListProps {
	accounts: Account[];
	selectedIds: string[];
	onToggle: (accountId: string) => void;
	summaries: Partial<Record<string, AccountSummary>>;
}

export function AccountToggleList({ accounts, selectedIds, onToggle, summaries }: AccountToggleListProps) {
	return (
		<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
			<ButtonsGroup>
				{accounts.map((account) => {
					const isActive = selectedIds.includes(account.id);
					const summary = summaries[account.id];
					const deltaValue = summary ? summary.delta : 0;
					const hasDelta = deltaValue !== 0;
					const deltaLabel = hasDelta
						? `${deltaValue > 0 ? '+' : ''}${formatCurrency(deltaValue, account.currency)}`
						: formatCurrency(summary ? summary.endBalance : account.initialBalance, account.currency);

					return (
						<Button
							key={account.id}
							hint={deltaLabel}
							active={isActive}
							onClick={() => {
								onToggle(account.id);
							}}
						>
							<span className="flex items-center gap-2">
								<span className="h-3 w-3 rounded-full" style={{ backgroundColor: account.color ?? '#34d399' }} />
								<span className="font-semibold">{account.name}</span>
							</span>
						</Button>
					);
				})}
			</ButtonsGroup>
		</div>
	);
}
