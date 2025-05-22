export function StatusBar() {
	return (
		<div className="flex w-full bg-blue-500 px-4 font-mono text-sm text-white py-1 justify-between">
			<div className="flex items-center gap-2">
				<div className="flex items-center gap-2">
					<div className="i-solar-archive-minimalistic-broken opacity-80" />
					1120 tasks. 43% done. <span className="font-bold">||||<span className="opacity-50">||||||</span></span>
				</div>
			</div>

			<div className="flex items-center gap-2" />
		</div>
	);
}
