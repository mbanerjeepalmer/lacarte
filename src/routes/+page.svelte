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

	const rows = Object.values(rowGroups);

	console.log(
		'Count of items per row:',
		Object.entries(rowGroups).map(([y, items]) => `Row ${y}: ${items.length} items`)
	);

	// const gridItems: GridItem[] = Object.entries(rowGroups).flatMap(([y, rowPieces]) => {
	// 	// Sort from whimsical to serious
	// 	const sorted = [...rowPieces].sort((a, b) => a.tone - b.tone);

	// 	// Assign X positions based on order in row
	// 	return sorted.map((piece, i) => ({
	// 		...piece,
	// 		gridX: i,
	// 		gridY: Number(y)
	// 	}));
	// });

	// const maxX = Math.max(...gridItems.map((item) => item.gridX)) + 1;
	// const maxY = Math.max(...gridItems.map((item) => item.gridY)) + 1;

	const maxX = Math.max(...rows.map((row) => row.length)) + 1;
	console.debug('Max X:', maxX);
</script>

<div class="h-screen w-screen snap-both snap-mandatory overflow-auto">
	<div class="flex flex-col gap-2 p-2">
		{#each rows as row}
			<div class="flex snap-x flex-row gap-2">
				{#each row as item}
					<div class="snap-center border-2 border-gray-200 p-4 shadow-lg">
						{item.title}
						<ul>
							<li>
								topic projection: {item.topicProjection}
							</li>
							<li>
								tone: {item.tone}
							</li>
						</ul>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>
