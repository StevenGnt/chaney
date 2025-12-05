import { Hint } from './Hint';

interface SectionProps {
	title: string;
	hint: string;
	children: React.ReactNode;
}

export function Section({ title, hint, children }: SectionProps) {
	return (
		<section className="rounded-lg border border-white/10 bg-white/5 p-4">
			<header className="mb-3 flex items-center justify-between">
				<p className="text-sm font-semibold text-white">{title}</p>

				{hint && <Hint>{hint}</Hint>}
			</header>
			{children}
		</section>
	);
}
