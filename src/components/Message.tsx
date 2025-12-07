export function Message({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/20 text-sm text-slate-400">
			{children}
		</div>
	);
}
