import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Hint } from '@/components/Hint';
import { Section } from '@/components/Section';
import type { Account } from '@/features/ForecastWorkspace/types';
import { filterTransactions, type VisibleTransaction } from '@/features/ForecastWorkspace/utils/filterTransactions';
import { DEFAULT_COLOR } from '@/lib/constants';
import type { ForecastRange } from '@/lib/finance/projection';

interface TransactionsPanelProps {
	accounts: Account[];
	selectedAccountIds: string[];
	dateRange: ForecastRange;
}

export function TransactionsPanel({ accounts, selectedAccountIds, dateRange }: TransactionsPanelProps) {
	const { t } = useTranslation();

	// Filter transactions using the centralized utility
	const visibleTransactions = useMemo<VisibleTransaction[]>(() => {
		return filterTransactions(accounts, selectedAccountIds, dateRange);
	}, [accounts, selectedAccountIds, dateRange]);

	// Group transactions by account ID for collapsible account sections
	const groupedTransactions = useMemo(() => {
		const groups: {
			accountId: string;
			accountName: string;
			accountColor?: string;
			currency: string;
			items: VisibleTransaction[];
		}[] = [];

		const byId = new Map<string, (typeof groups)[number]>();

		// Group transactions by account ID
		for (const tx of visibleTransactions) {
			let group = byId.get(tx.accountId);
			if (!group) {
				group = {
					accountId: tx.accountId,
					accountName: tx.accountName,
					accountColor: tx.accountColor,
					currency: tx.currency,
					items: [],
				};
				byId.set(tx.accountId, group);
				groups.push(group);
			}
			group.items.push(tx);
		}

		return groups;
	}, [visibleTransactions]);

	if (groupedTransactions.length === 0) {
		return null;
	}

	return (
		<Section title={t('FORECAST.TRANSACTIONS.TITLE')} hint={t('FORECAST.TRANSACTIONS.HINT')}>
			<div className="max-h-60 space-y-2 overflow-auto pr-1 text-sm">
				{groupedTransactions.map((group) => (
					<AccountTransactionsGroup key={group.accountId} group={group} />
				))}
			</div>
		</Section>
	);
}

interface AccountTransactionsGroupProps {
	group: {
		accountId: string;
		accountName: string;
		accountColor?: string;
		items: VisibleTransaction[];
	};
}

function AccountTransactionsGroup({ group }: AccountTransactionsGroupProps) {
	const { t } = useTranslation();

	// Group transactions by type (monthly/weekly/single) and sort each group chronologically
	const groupedByType = useMemo(() => {
		const monthly = group.items
			.filter((item) => item.groupType === 'monthly')
			.sort((left, right) => left.firstOccurrence.getTime() - right.firstOccurrence.getTime());
		const weekly = group.items
			.filter((item) => item.groupType === 'weekly')
			.sort((left, right) => left.firstOccurrence.getTime() - right.firstOccurrence.getTime());
		const single = group.items
			.filter((item) => item.groupType === 'single')
			.sort((left, right) => left.firstOccurrence.getTime() - right.firstOccurrence.getTime());

		return { monthly, weekly, single };
	}, [group.items]);

	return (
		<details className="rounded-s border border-white/10 bg-white/5">
			<summary className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2">
				<span className="flex items-center gap-2">
					<span className="h-2 w-2 rounded-full" style={{ backgroundColor: group.accountColor ?? DEFAULT_COLOR }} />
					<span className="font-semibold text-white">
						{group.accountName} <Hint>({t('FORECAST.TRANSACTIONS.COUNT', { count: group.items.length })})</Hint>
					</span>
				</span>
			</summary>
			<div className="space-y-2 border-t border-white/10 px-3 py-2">
				{groupedByType.monthly.length > 0 && (
					<TransactionGroup label={t('FORECAST.TRANSACTIONS.MONTHLY')} transactions={groupedByType.monthly} />
				)}
				{groupedByType.weekly.length > 0 && (
					<TransactionGroup label={t('FORECAST.TRANSACTIONS.WEEKLY')} transactions={groupedByType.weekly} />
				)}
				{groupedByType.single.length > 0 && (
					<TransactionGroup label={t('FORECAST.TRANSACTIONS.SINGLE')} transactions={groupedByType.single} />
				)}
			</div>
		</details>
	);
}

interface TransactionGroupProps {
	transactions: VisibleTransaction[];
	label: string;
}

function TransactionGroup({ transactions, label }: TransactionGroupProps) {
	return (
		<div>
			<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-300">{label}</p>
			<ul className="space-y-1">
				{transactions.map((transaction) => (
					<TransactionItem key={transaction.id} transaction={transaction} />
				))}
			</ul>
		</div>
	);
}

interface TransactionItemProps {
	transaction: VisibleTransaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
	return (
		<li className="flex items-center justify-between gap-3">
			<div>
				<p className="font-medium text-white">{transaction.label}</p>
				<p className="text-xs text-slate-400">{transaction.category}</p>
			</div>
			<span
				className={['text-xs font-semibold', transaction.type === 'income' ? 'text-emerald-300' : 'text-rose-300'].join(
					' ',
				)}
			>
				{transaction.type === 'income' ? '+' : '-'}
				{transaction.amount.toLocaleString(undefined, {
					style: 'currency',
					currency: transaction.currency,
				})}
			</span>
		</li>
	);
}
