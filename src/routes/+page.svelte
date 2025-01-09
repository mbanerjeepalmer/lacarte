<script lang="ts">
	import type { PageData } from './$types';
	import type { RedditPost } from '$lib/types';
	let { data }: { data: PageData } = $props();

	interface Piece {
		reddit_id: string;
		title: string;
		tone: number;
		topicProjection: number;
		source: string;
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
	console.debug('Pieces:', pieces);

	const rowGroups = pieces.reduce(
		(acc: Record<number, Piece[]>, piece: Piece) => {
			// To
			// Map 0-1 range to 0-4 grid positions
			const y = Math.min(numRows, Math.floor(piece.topicProjection * numRows));
			acc[y] = acc[y] || [];
			acc[y].push(piece);
			return acc;
		},
		{} as Record<number, Piece[]>
	);

	const entries = Object.entries(rowGroups) as [string, Piece[]][];
	console.debug(entries.map(([y, items]) => `Row: ${y}, Count: ${items.length}`));

	// First, calculate the maximum items in any row
	const values = Object.values(rowGroups) as Piece[][];
	const maxItemsInRow = Math.max(...values.map((row) => row.length));
	console.debug(`Max items in row: ${maxItemsInRow}`);

	const gridItems: GridItem[] = entries.flatMap(([y, rowPieces]) => {
		// Sort from whimsical to serious
		const sorted = [...rowPieces].sort((a, b) => a.tone - b.tone);

		// Calculate starting X position to center items
		const startX = Math.floor((maxItemsInRow - sorted.length) / 2) + 1;

		// Assign X positions based on order in row, offset by startX
		return sorted.map((piece, i) => ({
			...piece,
			gridX: startX + i,
			gridY: Number(y)
		}));
	});
</script>

<div class="h-screen w-screen snap-both snap-mandatory overflow-auto">
	<div
		class="mx-auto grid gap-2 p-2"
		style="
			grid-template-columns: repeat({maxItemsInRow}, 200px); 
			grid-template-rows: repeat({numRows}, auto);
			justify-content: center;
		"
	>
		{#each gridItems as item}
			<div
				class="w-[200px] snap-center border-2 border-gray-200 p-4 shadow-lg"
				style="grid-row: {item.gridY}; grid-column: {item.gridX};"
			>
				{item.title}
				<ul class="mt-2 font-mono">
					<li>topic: {item.topicProjection}</li>
					<li>tone: {item.tone}</li>
					<li>row: {item.gridY}</li>
					<li>column: {item.gridX}</li>
				</ul>
			</div>
		{/each}
	</div>
</div>
