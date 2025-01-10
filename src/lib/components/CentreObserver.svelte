<script lang="ts">
	let { centred = $bindable({ id: '' }), id, children } = $props();
	const threshold = 0.6;
	let element = $state<HTMLElement>();
	let is_centred = $state(false);

	$effect(() => {
		if (!element) return;

		console.debug('Setting up intersection observer for center detection');

		const observer = new IntersectionObserver(
			(entries) => {
				console.debug(JSON.stringify(entries));
				const [entry] = entries;
				if (entry.isIntersecting) {
					console.debug(`Centred ${id}`);
					centred.id = id;
				}
			},
			{
				threshold,
				rootMargin: '0px'
			}
		);

		observer.observe(element);

		return () => {
			console.debug('Cleaning up intersection observer');
			observer.disconnect();
		};
	});
</script>

<div
	class={`border-2 border-black bg-red-500 ${is_centred ? 'bg-green-500' : ''}`}
	bind:this={element}
>
	{@render children()}
</div>
