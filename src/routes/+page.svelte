<script lang="ts">
	import CenterObserver from '$lib/components/CentreObserver.svelte';
	const { data } = $props();
	let random_pieces = $state<typeof data.pieces>([]);
	if (data.pieces) {
		random_pieces = [...data.pieces].sort(() => Math.random() - 0.5).slice(0, 9);
	}

	let current_piece = $state<(typeof random_pieces)[0]>();

	let centred = $state({ id: '' });
	let test = $state(false);

	$effect(() => {
		if (current_piece) {
			console.info('Center piece changed:', current_piece.title);
		}
	});
</script>

<div class="relative overflow-auto">
	<div class="grid grid-cols-[repeat(3,80vw)] grid-rows-[repeat(3,80vh)] overflow-scroll">
		{#if random_pieces.length > 0}
			{#each random_pieces as piece}
				<CenterObserver bind:centred id={piece.id}>
					{piece.title}
				</CenterObserver>
			{/each}
		{/if}
	</div>
</div>
