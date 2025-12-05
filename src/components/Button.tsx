interface ButtonProps {
	children: React.ReactNode;
	active: boolean;
	onClick: () => void;
}

export function Button({ children, active, onClick }: ButtonProps) {
	return (
		<button
			type="button"
			className={[
				'inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm transition',
				active
					? 'border-emerald-400/60 bg-emerald-400/10 text-white'
					: 'border-white/10 bg-black/20 text-slate-200 hover:border-white/20',
			].join(' ')}
			onClick={onClick}
		>
			{children}
		</button>
	);
}
