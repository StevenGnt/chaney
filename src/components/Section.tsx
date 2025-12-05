interface SectionProps {
	title: string;
	hint: string;
	children: React.ReactNode;
}

export function Section({ title, hint, children }: SectionProps) {
	return (
		<section className="rounded-2xl border border-white/10 bg-white/5 p-4">
			<header className="mb-3 flex items-center justify-between">
				<p className="text-sm font-semibold text-white">{title}</p>

				{hint && <span className="text-xs text-slate-400">{hint}</span>}
			</header>
			{children}
		</section>
	);
}
