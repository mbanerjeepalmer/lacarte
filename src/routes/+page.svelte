<script lang="ts">
	import { pieces, type Piece } from '$lib/mock-data';

	interface GridItem extends Piece {
		gridX: number;
		gridY: number;
	}

	// As a stopgap until I work out a better algorithm we're just grouping by topic and then sorting within each row.
	// Later it would be nice to make it more consistent.
	// So if you're on topic 0.5 and tone 0.7, then moving to topic 0.6 keeps tone 0.7
	const numRows = 10;

	const rowGroups = pieces.reduce((acc: Record<number, Piece[]>, piece) => {
		// To
		// Map 0-1 range to 0-4 grid positions
		const y = Math.min(numRows, Math.floor(piece.topicProjection * numRows + 1));
		acc[y] = acc[y] || [];
		acc[y].push(piece);
		return acc;
	}, {});

	console.log(
		'Count of items per row:',
		Object.entries(rowGroups).map(([y, items]) => `Row ${y}: ${items.length} items`)
	);

	const gridItems: GridItem[] = Object.entries(rowGroups).flatMap(([y, rowPieces]) => {
		// Sort from whimsical to serious
		const sorted = [...rowPieces].sort((a, b) => a.tone - b.tone);

		// Assign X positions based on order in row
		return sorted.map((piece, i) => ({
			...piece,
			gridX: i,
			gridY: Number(y)
		}));
	});

	const maxX = Math.max(...gridItems.map((item) => item.gridX)) + 1;
	const maxY = Math.max(...gridItems.map((item) => item.gridY)) + 1;

	console.log('Grid dimensions:', { maxX, maxY });
</script>

<div class="h-screen w-screen snap-both snap-mandatory overflow-auto">
	<div
		class="grid gap-4 p-4"
		style="grid-template-columns: repeat({maxX}, 20vw); 
				grid-template-rows: repeat({maxY}, 20vh);"
	>
		{#each gridItems as item}
			<div
				class="flex min-h-[20vh] min-w-[20vw] snap-center items-center
					   justify-center border border-gray-200 bg-white text-sm shadow-lg"
				style="grid-column: {item.gridX + 1}; grid-row: {item.gridY + 1};"
			>
				<div class="max-w-[90%] overflow-hidden p-4">
					<h2 class="mb-1 truncate text-base font-bold">{item.title}</h2>
					<div class="text-xs opacity-70">
						<div class="truncate">Topics: {item.topics.join(', ')}</div>
						<div>Tone: {item.tone.toFixed(2)}</div>
						<div>Topic Projection: {item.topicProjection.toFixed(2)}</div>
						<div>Grid: ({item.gridX}, {item.gridY})</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
