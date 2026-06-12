<script lang="ts">
	let { items, class: className = '' } = $props<{
		items: { q: string; a: string }[];
		class?: string;
	}>();
</script>

<div class="space-y-3 {className}">
	{#each items as item (item.q)}
		<details class="neo-card-sm group p-0">
			<summary
				class="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold marker:content-none [&::-webkit-details-marker]:hidden"
			>
				<span>{item.q}</span>
				<i
					class="fa-solid fa-plus shrink-0 text-sm transition group-open:rotate-45"
					aria-hidden="true"
				></i>
			</summary>
			<div
				class="border-t-[3px] border-(--app-border) px-5 pt-4 pb-5 text-sm leading-7 font-medium text-(--app-muted)"
			>
				{item.a}
			</div>
		</details>
	{/each}
</div>
