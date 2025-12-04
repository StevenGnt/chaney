import type { Account } from '@/features/forecast/types';
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
			<div className="flex flex-wrap gap-2">
				{accounts.map((account) => {
					const isActive = selectedIds.includes(account.id);
					const summary = summaries[account.id];
					const deltaValue = summary ? summary.delta : 0;
					const hasDelta = deltaValue !== 0;
					const deltaLabel = hasDelta
						? `${deltaValue > 0 ? '+' : ''}${formatCurrency(deltaValue, account.currency)}`
						: formatCurrency(summary ? summary.endBalance : account.initialBalance, account.currency);

					return (
						<button
							key={account.id}
							type="button"
							className={[
								'inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm transition',
								isActive
									? 'border-emerald-400/60 bg-emerald-400/10 text-white'
									: 'border-white/10 bg-black/20 text-slate-200 hover:border-white/20',
							].join(' ')}
							onClick={() => {
								onToggle(account.id);
							}}
						>
							<span className="flex items-center gap-2">
								<span className="h-3 w-3 rounded-full" style={{ backgroundColor: account.color ?? '#34d399' }} />
								<span className="font-semibold">{account.name}</span>
							</span>
							<span className="text-xs text-slate-300">{deltaLabel}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
