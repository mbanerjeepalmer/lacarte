<script lang="ts">
	// Mock data - just numbers for now
	const items = Array.from({ length: 25 }, (_, i) => i + 1);
</script>

<div class="h-screen w-screen snap-both snap-mandatory overflow-auto">
	<div class="grid grid-cols-[repeat(5,90vw)] grid-rows-[repeat(5,90vh)] gap-4 p-4">
		{#each items as item}
			<div
				class="flex min-h-[90vh] min-w-[90vw] snap-center items-center
					   justify-center rounded-xl bg-white text-4xl shadow-lg"
			>
				{item}
			</div>
		{/each}
	</div>
</div>
