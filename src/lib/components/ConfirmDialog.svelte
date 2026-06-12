<script lang="ts">
	let {
		open = $bindable(false),
		title,
		message,
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		danger = false,
		loading = false,
		onconfirm
	} = $props<{
		open?: boolean;
		title: string;
		message: string;
		confirmLabel?: string;
		cancelLabel?: string;
		danger?: boolean;
		loading?: boolean;
		onconfirm: () => void | Promise<void>;
	}>();

	let working = $state(false);

	async function handleConfirm() {
		working = true;
		try {
			await onconfirm();
			open = false;
		} finally {
			working = false;
		}
	}

	const busy = $derived(loading || working);
</script>

{#if open}
	<div
		class="neo-dialog-backdrop"
		role="presentation"
		onclick={(event) => {
			if (event.target === event.currentTarget && !busy) open = false;
		}}
		onkeydown={(event) => {
			if (event.key === 'Escape' && !busy) open = false;
		}}
	>
		<div
			class="neo-dialog neo-card-sm"
			role="dialog"
			aria-modal="true"
			aria-labelledby="neo-dialog-title"
		>
			<h2 id="neo-dialog-title" class="text-lg font-bold">{title}</h2>
			<p class="mt-2 text-sm leading-6 text-(--app-muted)">{message}</p>

			<div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
				<button
					type="button"
					class="neo-btn neo-btn-ghost w-full sm:w-auto"
					disabled={busy}
					onclick={() => (open = false)}
				>
					{cancelLabel}
				</button>
				<button
					type="button"
					class="neo-btn w-full sm:w-auto {danger ? 'neo-btn-danger' : 'neo-btn-primary'}"
					disabled={busy}
					onclick={handleConfirm}
				>
					{busy ? 'Working…' : confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
