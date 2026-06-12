<script lang="ts">
	import { copyText } from '$lib/copy';

	let { text, label = 'Copy' } = $props<{ text: string; label?: string }>();
	let copied = $state(false);

	async function copy() {
		const ok = await copyText(text);
		if (!ok) return;
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<button
	type="button"
	onclick={copy}
	class="neo-btn neo-btn-secondary w-full px-3 py-2.5 text-xs sm:w-auto"
>
	{#if copied}
		<i class="fa-solid fa-check"></i> Copied
	{:else}
		<i class="fa-regular fa-copy"></i> {label}
	{/if}
</button>
