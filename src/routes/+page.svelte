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

	const pieces = data.pieces || [];
	console.debug('PIECES:', JSON.stringify(pieces));

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
	console.debug(JSON.stringify(entries.map(([y, items]) => `Row ${y}: ${items.length} items.`)));

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
		class="grid w-fit gap-2 px-[10vw] py-[10vh]"
		style="
			grid-template-columns: repeat({maxItemsInRow}, minmax(min(80vw, 50rem), min(80vw, 50rem))); 
			grid-template-rows: repeat({numRows}, auto);

		"
	>
		{#each gridItems as item}
			<div
				class="snap-center rounded-lg border border-gray-300 bg-white p-4 transition-all duration-200 hover:border-gray-500"
				style="grid-row: {item.gridY}; grid-column: {item.gridX};"
			>
				<div class="flex flex-col gap-2">
					<!-- Post Header -->
					<div class="text-xs text-gray-500">
						<a href="https://reddit.com/r/{item.subreddit}" class="hover:underline"
							>r/{item.subreddit}</a
						>
						• Posted by
						<a href="https://reddit.com/user/{item.author}" class="hover:underline"
							>u/{item.author}</a
						>
					</div>

					<!-- Title -->
					<h2 class="text-lg font-medium">
						<a href={item.url} class="hover:underline">{item.title}</a>
					</h2>

					<!-- Preview Image/Video if available -->
					{#if item.preview?.images?.[0]?.source}
						<div class="relative pt-[56.25%]">
							<img
								src={item.preview.images[0].source.url}
								alt=""
								class="absolute inset-0 h-full w-full rounded-md object-cover"
							/>
						</div>
					{:else if item.thumbnail && item.thumbnail !== 'self' && item.thumbnail !== 'default'}
						<div class="relative pt-[56.25%]">
							<img
								src={item.thumbnail}
								alt=""
								class="absolute inset-0 h-full w-full rounded-md object-cover"
							/>
						</div>
					{/if}

					<!-- Post Stats -->
					<div class="flex items-center gap-4 text-sm text-gray-500">
						<!-- Score -->
						<div class="flex items-center gap-1">
							<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
								<path
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
								/>
							</svg>
							{item.score?.toLocaleString() ?? 0}
						</div>

						<!-- Comments -->
						<a
							href="https://reddit.com{item.permalink}"
							class="flex items-center gap-1 hover:text-gray-700"
						>
							<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
								<path
									d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
								/>
							</svg>
							{item.num_comments?.toLocaleString() ?? 0} comments
						</a>

						<!-- Share -->
						<!-- <button class="flex items-center gap-1 hover:text-gray-700">
							<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
								<path
									d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"
								/>
							</svg>
							Share
						</button> -->
					</div>

					<div class="mt-4 font-mono text-xs text-gray-400">
						<div>topics: {item.topics?.join(', ')}</div>
						<div>topic projection: {item.topicProjection}</div>
						<div>tone: {item.tone?.toFixed(2)}</div>
						<div>row: {item.gridY}</div>
						<div>column: {item.gridX}</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<!-- <div class="fixed bottom-4 right-4">
	<button
		class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
		onclick={refreshData}
	>
		Refresh Data
	</button>
</div> -->
