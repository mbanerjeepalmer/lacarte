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
	}

	// Core state - separate concerns
	let current_position = $state<GridPosition>({ row: 0, col: 0 });
	let virtual_grid = $state<Map<string, GridPiece>>(new Map());

	// Utility functions
	function get_position_key(pos: GridPosition): string {
		return `${pos.row},${pos.col}`;
	}

	function get_piece_at_position(position: GridPosition): GridPiece | undefined {
		return virtual_grid.get(get_position_key(position));
	}

	function generate_piece_for_position(position: GridPosition): GridPiece {
		console.debug('Generating piece for position:', position);

		// Get currently unused pieces
		const used_ids = new Set([...virtual_grid.values()].map((p) => p.id));
		const available_pieces = data.pieces.filter((p) => !used_ids.has(p.id));

		const piece =
			available_pieces.length > 0
				? available_pieces[Math.floor(Math.random() * available_pieces.length)]
				: data.pieces[Math.floor(Math.random() * data.pieces.length)];

		return {
			...piece,
			position
		};
	}

	function generate_surrounding_pieces(center: GridPosition) {
		console.debug('Generating pieces around:', center);
		const new_grid = new Map(virtual_grid);
		for (let row = center.row - 1; row <= center.row + 1; row++) {
			for (let col = center.col - 1; col <= center.col + 1; col++) {
				const pos = { row, col };
				const key = get_position_key(pos);
				if (!new_grid.has(key)) {
					new_grid.set(key, generate_piece_for_position(pos));
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
							<div>{piece.title}</div>
						{:else}
							<div class="text-gray-400">Empty</div>
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
