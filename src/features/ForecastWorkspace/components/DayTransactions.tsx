import type { Account, Transaction } from '../types';
import Amount from '@/components/Amount';

interface DayTransactionsProps {
	account: Account;
	transactionsIds: string[];
	onClose: () => void;
}

function DayTransactions({ account, transactionsIds, onClose }: DayTransactionsProps) {
	const transactions = transactionsIds.map((transactionId) =>
		account.transactions.find((transaction) => transaction.id === transactionId),
	) as Transaction[];

	return (
		<div>
			<button onClick={onClose}>Close</button>
			{transactions.length === 0 ? (
				<p>No transactions found</p>
			) : (
				<ul>
					{transactions.map((transaction) => (
						<li key={transaction.id}>
							{transaction.label} <Amount amount={transaction.amount} currency={account.currency} />
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default DayTransactions;
