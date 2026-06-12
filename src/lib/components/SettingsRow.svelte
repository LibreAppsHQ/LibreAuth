<script lang="ts">
	let { children, class: className = '' } = $props<{
		children: import('svelte').Snippet;
		class?: string;
	}>();
</script>

<div class="p-4 sm:p-5 {className}">
	{@render children()}
</div>
