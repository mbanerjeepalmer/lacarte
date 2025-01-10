<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let { id, children } = $props();
	let is_centered = $state(false);
	let element = $state<HTMLElement>();

	// This is a legitimate use of $effect as it handles DOM manipulation
	$effect(() => {
		if (!element) return;

		console.debug('Setting up intersection observer for:', id);

		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry.isIntersecting) {
					console.debug(`Piece ${id} is now centered`);
					is_centered = true;
					dispatch('centered');
				} else {
					is_centered = false;
				}
			},
			{
				threshold: 0.6,
				rootMargin: '0px'
			}
		);

		observer.observe(element);

		return () => {
			console.debug('Cleaning up intersection observer for:', id);
			observer.disconnect();
		};
	});
</script>

<div
	class={`border-2 border-black ${is_centered ? 'bg-green-500' : 'bg-red-500'}`}
	bind:this={element}
>
	{id}
	{@render children()}
</div>
