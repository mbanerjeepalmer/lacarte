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
			`relative to center tone: ${center_tone.toFixed(2)}`
		);

		const available_pieces = data.pieces.filter((p) => !used_piece_ids.has(p.id));

		if (available_pieces.length === 0) {
			console.debug('No more available pieces for position:', position);
			return null;
		}

		const col_diff = position.col - current_position.col;
		let desired_tone: number;

		if (col_diff < 0) {
			desired_tone = Math.max(0, center_tone - 0.2);
		} else if (col_diff > 0) {
			desired_tone = Math.min(1, center_tone + 0.2);
		} else {
			desired_tone = center_tone;
		}

		console.debug('Desired tone:', desired_tone.toFixed(2), 'for column offset:', col_diff);

		const sorted_pieces = [...available_pieces].sort((a, b) => {
			const a_diff = Math.abs(a.tone - desired_tone);
			const b_diff = Math.abs(b.tone - desired_tone);
			return a_diff - b_diff;
		});

		if (!sorted_pieces.length) {
			console.debug('No pieces available in desired range for position:', position);
			return null;
		}

		const piece = sorted_pieces[0];
		used_piece_ids.add(piece.id);

		console.debug('Selected piece tone:', piece.tone.toFixed(2));

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
							<div class="line-clamp-3">{piece.title}</div>
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
		<button class="bg-blue-500 p-2 text-white" on:click={() => move('up')}>Up</button>
		<div></div>
		<button class="bg-blue-500 p-2 text-white" on:click={() => move('left')}>Left</button>
		<div class="p-2 text-center">
			({current_position.row}, {current_position.col})
		</div>
		<button class="bg-blue-500 p-2 text-white" on:click={() => move('right')}>Right</button>
		<div></div>
		<button class="bg-blue-500 p-2 text-white" on:click={() => move('down')}>Down</button>
		<div></div>
	</div>
</div>
