import clsx from 'clsx';

function Amount({ amount, currency }: { amount: number; currency: string }) {
	return (
		<span className={clsx('text-xs font-semibold', amount >= 0 ? 'text-emerald-300' : 'text-rose-300')}>
			{amount >= 0 ? '+' : ''}
			{amount.toLocaleString(undefined, { style: 'currency', currency: currency })}
		</span>
	);
}

export default Amount;
