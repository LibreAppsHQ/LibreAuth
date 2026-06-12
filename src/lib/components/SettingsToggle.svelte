<script lang="ts">
	let { checked, label, description, onchange } = $props<{
		checked: boolean;
		label: string;
		description?: string;
		onchange: (value: boolean) => void;
	}>();
</script>

<div class="flex items-start justify-between gap-4">
	<div class="min-w-0">
		<p class="text-sm font-bold">{label}</p>
		{#if description}
			<p class="mt-1 text-xs leading-5 text-(--app-muted)">{description}</p>
		{/if}
	</div>
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		aria-label={label}
		onclick={() => onchange(!checked)}
		class="neo-settings-toggle shrink-0 {checked ? 'neo-settings-toggle-on' : ''}"
	>
		<span class="neo-settings-toggle-knob"></span>
	</button>
</div>
