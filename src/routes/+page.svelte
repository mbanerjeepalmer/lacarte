<script lang="ts">
	const { data } = $props();

	interface GridPosition {
		row: number;
		col: number;
	}

	interface GridPiece {
		id: string;
		title: string;
		position: GridPosition;
		tone: number;
		topicProjection: number;
	}

	// Core state
	let current_position = $state<GridPosition>({ row: 0, col: 0 });
	let virtual_grid = $state<Map<string, GridPiece | null>>(new Map()); // Explicitly allow null
	let used_piece_ids = $state<Set<string>>(new Set());

	// Derived values
	let center_piece = $derived(get_piece_at_position(current_position));
	let center_tone = $derived(center_piece?.tone ?? 0.5);
	let center_topic = $derived(center_piece?.topicProjection ?? 0.5);

	// Utility functions
	function get_position_key(pos: GridPosition): string {
		return `${pos.row},${pos.col}`;
	}

	function get_piece_at_position(position: GridPosition): GridPiece | undefined {
		return virtual_grid.get(get_position_key(position));
	}

	function generate_piece_for_position(position: GridPosition): GridPiece | null {
		console.debug(
			'Generating piece for position:',
			position,
			`relative to center - tone: ${center_tone.toFixed(4)}, topic: ${center_topic}`
		);

		const available_pieces = data.pieces.filter((p) => !used_piece_ids.has(p.id));

		if (available_pieces.length === 0) {
			console.debug('No more available pieces for position:', position);
			return null;
		}

		// Calculate desired ranges based on position
		const col_diff = position.col - current_position.col;
		const row_diff = position.row - current_position.row;

		// Tone calculation (horizontal) - keeping existing logic
		let desired_tone = center_tone;
		if (col_diff < 0) {
			desired_tone = Math.max(0, center_tone - 0.2);
		} else if (col_diff > 0) {
			desired_tone = Math.min(1, center_tone + 0.2);
		}

		// Topic calculation (vertical)
		let desired_topic = center_topic;
		if (row_diff < 0) {
			desired_topic = Math.max(0, center_topic - 0.0002);
		} else if (row_diff > 0) {
			desired_topic = Math.min(1, center_topic + 0.0002);
		}

		console.debug(
			`Desired values - tone: ${desired_tone.toFixed(4)}, topic: ${desired_topic.toFixed(4)}`,
			`for offset: (${row_diff}, ${col_diff})`
		);

		// Sort by combined difference
		const sorted_pieces = [...available_pieces].sort((a, b) => {
			const a_tone_diff = Math.abs(a.tone - desired_tone);
			const b_tone_diff = Math.abs(b.tone - desired_tone);
			const a_topic_diff = Math.abs(a.topicProjection - desired_topic);
			const b_topic_diff = Math.abs(b.topicProjection - desired_topic);

			// Weight tone differences more heavily than topic (since topic range is smaller)
			const a_total = a_tone_diff * 5 + a_topic_diff * 1000;
			const b_total = b_tone_diff * 5 + b_topic_diff * 1000;

			return a_total - b_total;
		});

		if (!sorted_pieces.length) {
			console.debug('No pieces available in desired ranges for position:', position);
			return null;
		}

		const piece = sorted_pieces[0];
		used_piece_ids.add(piece.id);

		console.debug(
			'Selected piece -',
			`tone: ${piece.tone.toFixed(4)},`,
			`topic: ${piece.topicProjection.toFixed(4)}`
		);

		return {
			...piece,
			position
		};
	}

	function generate_surrounding_pieces(center: GridPosition) {
		console.debug('Generating pieces around:', center);
		const new_grid = new Map(virtual_grid);

		// Always set all nine positions
		for (let row = center.row - 1; row <= center.row + 1; row++) {
			for (let col = center.col - 1; col <= center.col + 1; col++) {
				const pos = { row, col };
				const key = get_position_key(pos);

				// Only generate new pieces for positions we haven't seen before
				if (!new_grid.has(key)) {
					const piece = generate_piece_for_position(pos);
					new_grid.set(key, piece); // Always set the position, even if piece is null
				}
			}
		}
		return new_grid;
	}

	// Movement and grid update
	function move(direction: 'up' | 'down' | 'left' | 'right') {
		const new_position = { ...current_position };

		switch (direction) {
			case 'up':
				new_position.row--;
				break;
			case 'down':
				new_position.row++;
				break;
			case 'left':
				new_position.col--;
				break;
			case 'right':
				new_position.col++;
				break;
		}

		console.info('Moving to position:', new_position);

		// Update state in one go
		virtual_grid = generate_surrounding_pieces(new_position);
		current_position = new_position;
	}

	// Initial grid setup - only runs once
	if (data.pieces?.length) {
		console.debug('Setting up initial grid');
		const initial_piece = {
			...data.pieces[0],
			position: { row: 0, col: 0 }
		};

		used_piece_ids.add(initial_piece.id);
		virtual_grid.set('0,0', initial_piece);
		virtual_grid = generate_surrounding_pieces({ row: 0, col: 0 });
	}
</script>

<header class="mx-auto max-w-md text-center font-light text-gray-600">
	<h1>Roammit</h1>
	<p class="text-xs">
		Like that <a
			class="underline decoration-gray-400 underline-offset-2"
			href="https://www.flickr.com/photos/roamer-educationalrobot/14817194049">robot</a
		> except with Reddit. Up/down is topic, left/right is tone.
	</p>
</header>
<div class="flex flex-col items-center gap-4 p-4">
	<div class="grid grid-cols-3 gap-2">
		{#each [-1, 0, 1] as row}
			{#each [-1, 0, 1] as col}
				{@const position = {
					row: current_position.row + row,
					col: current_position.col + col
				}}
				{@const piece = get_piece_at_position(position)}
				<div
					class="flex h-[200px] w-[200px] items-center justify-center border-2 border-black p-4"
					class:bg-green-500={row === 0 && col === 0}
					class:bg-gray-200={row !== 0 || col !== 0}
				>
					<div class="text-center">
						{#if piece}
							<a href="https://reddit.com{piece.permalink}" target="_blank" class="hover:underline">
								<div class="line-clamp-3">{piece.title}</div>
							</a>
							<div class="mt-2 text-xs text-gray-600">
								Tone: {piece.tone.toFixed(2)}
								<br />
								Topic: {piece.topicProjection}
							</div>
						{:else}
							<div class="text-gray-400">Edge of Map</div>
						{/if}
						<div class="text-sm text-gray-600">
							({position.row}, {position.col})
						</div>
					</div>
				</div>
			{/each}
		{/each}
	</div>

	<div class="grid grid-cols-3 gap-2">
		<div></div>
		<button class="bg-blue-500 p-2 text-white" onclick={() => move('up')}>Up</button>
		<div></div>
		<button class="bg-blue-500 p-2 text-white" onclick={() => move('left')}>Left</button>
		<div class="p-2 text-center">
			({current_position.row}, {current_position.col})
		</div>
		<button class="bg-blue-500 p-2 text-white" onclick={() => move('right')}>Right</button>
		<div></div>
		<button class="bg-blue-500 p-2 text-white" onclick={() => move('down')}>Down</button>
		<div></div>
	</div>
</div>
