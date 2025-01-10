<script lang="ts">
	const { isCentred, id, piece } = $props();
	let thisTile = $state<HTMLDivElement>();
	const intersectionOptions = {
		rootMargin: '50%'
	};
</script>

<div bind:this={thisTile} class="border-2 border-black bg-red-500">
	{piece.title}
</div>
