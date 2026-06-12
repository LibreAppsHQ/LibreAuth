<script lang="ts">
	let { id, title, description, children } = $props<{
		id: string;
		title: string;
		description?: string;
		children: import('svelte').Snippet;
	}>();
</script>

<section {id} class="scroll-mt-28">
	<div class="mb-4">
		<h2 class="text-lg font-bold">{title}</h2>
		{#if description}
			<p class="mt-1 text-sm leading-6 text-(--app-muted)">{description}</p>
		{/if}
	</div>
	<div class="neo-card divide-y-[3px] divide-(--app-border)">
		{@render children()}
	</div>
</section>
