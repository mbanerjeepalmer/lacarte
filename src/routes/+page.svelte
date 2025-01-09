<script lang="ts">
	import type { PageData } from './$types';
	import type { Piece } from '$lib/types';
	let { data }: { data: PageData } = $props();

	function refreshData() {
		const url = new URL(window.location.href);
		url.searchParams.set('refresh', 'true');
		window.location.href = url.toString();
	}

	interface GridItem extends Piece {
		gridX: number;
		gridY: number;
	}

	// As a stopgap until I work out a better algorithm we're just grouping by topic and then sorting within each row.
	// Later it would be nice to make it more consistent.
	// So if you're on topic 0.5 and tone 0.7, then moving to topic 0.6 keeps tone 0.7
	const numRows = 20;

	const pieces = data.pieces.pieces || [];
	// console.debug('PIECES:', JSON.stringify(pieces));

	const projections = pieces.map((p: Piece) => p.topicProjection ?? 0.5);
	const minProjection = Math.min(...projections);
	const maxProjection = Math.max(...projections);
	const projectionRange = maxProjection - minProjection;
	console.debug('Projection min, max, range:', { minProjection, maxProjection, projectionRange });

	const rowGroups = pieces.reduce(
		(acc: Record<number, Piece[]>, piece: Piece) => {
			const normalisedProjection =
				projectionRange === 0
					? 0.499999
					: ((piece.topicProjection ?? 0.499999) - minProjection) / projectionRange;

			const y = Math.min(numRows - 1, Math.floor(normalisedProjection * numRows));
			console.debug(
				`'${piece.title}' (${piece.topicProjection}) normalised -> ${normalisedProjection} -> ${y}`
			);
			acc[y] = acc[y] || [];
			acc[y].push(piece);
			return acc;
		},
		{} as Record<number, Piece[]>
	);
	// console.debug('ROW GROUPS:', JSON.stringify(rowGroups));

	const entries = Object.entries(rowGroups) as [string, Piece[]][];
	console.debug(
		JSON.stringify(entries.map(([y, items]) => `Row index ${y} contains ${items.length} items.`))
	);

	// First, calculate the maximum items in any row
	const values = Object.values(rowGroups) as Piece[][];
	const maxItemsInRow = Math.max(...values.map((row) => row.length));
	console.debug(`Max items in row: ${maxItemsInRow}`);

	const gridItems: GridItem[] = entries.flatMap(([y, rowPieces]) => {
		// Sort from whimsical to serious
		rowPieces.sort((a, b) => (a.tone ?? 0.499999) - (b.tone ?? 0.499999));

		// Calculate starting X position to center items
		const startX = Math.floor((maxItemsInRow - rowPieces.length) / 2) + 1;

		// Assign X positions based on order in row, offset by startX
		return rowPieces.map((piece, i) => ({
			...piece,
			gridX: startX + i,
			gridY: parseInt(y)
		}));
	});
</script>

<div class="fixed inset-0 snap-both snap-mandatory overflow-auto">
	<div
		class="grid gap-2"
		style="
			grid-template-columns: repeat({maxItemsInRow}, minmax(min(80vw, 50rem), min(80vw, 50rem))); 
			grid-template-rows: repeat({numRows}, auto);

		"
	>
		{#each gridItems as item}
			<div
				class="snap-center border-2 border-gray-200 bg-white p-4"
				style="grid-row: {item.gridY}; grid-column: {item.gridX};"
			>
				{item.title}
				<ul class="mt-2 font-mono">
					{#if item.topics}
						<li>topics: {item.topics.join(', ')}</li>
					{/if}
					<li>topic: {item.topicProjection}</li>
					<li>tone: {item.tone}</li>
					<li>row: {item.gridY}</li>
					<li>column: {item.gridX}</li>
				</ul>
			</div>
		{/each}
	</div>
</div>

<div class="fixed bottom-4 right-4">
	<button
		class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
		onclick={refreshData}
	>
		Refresh Data
	</button>
</div>
