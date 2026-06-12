<script lang="ts">
	import { onMount } from 'svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import IssuerAvatar from '$lib/components/IssuerAvatar.svelte';
	import { copyText } from '$lib/copy';
	import { settingsStore } from '$lib/stores/settings';
	import { accountLabel, generateTotp, totpRemainingSeconds, type TotpEntry } from '$lib/totp';

	let {
		entry,
		compact = false,
		onDelete
	} = $props<{
		entry: TotpEntry;
		compact?: boolean;
		onDelete?: (id: string) => void;
	}>();

	let code = $state('------');
	let remaining = $state(30);
	let copied = $state(false);
	let interval: ReturnType<typeof setInterval> | undefined;

	async function tick() {
		try {
			code = await generateTotp(entry.secret, entry.period, entry.digits);
		} catch {
			code = '------';
		}
		remaining = totpRemainingSeconds(entry.period);
	}

	async function copyCode() {
		if (code === '------') return;
		const ok = await copyText(code);
		if (!ok) return;
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	onMount(() => {
		tick();
		interval = setInterval(tick, 1000);
		return () => clearInterval(interval);
	});

	const { title, subtitle } = $derived(accountLabel(entry));
	const urgent = $derived(remaining <= Math.max(3, Math.floor(entry.period * 0.15)));
</script>

<article
	class="neo-card animate-neo-pop {compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'} {urgent
		? 'ring-2 ring-(--app-accent-alt)'
		: ''}"
>
	<div class="flex items-start justify-between gap-4">
		<div class="flex min-w-0 items-start gap-3">
			<IssuerAvatar
				issuer={entry.issuer}
				name={entry.name}
				showLogo={$settingsStore.showIssuerLogos}
			/>
			<div class="min-w-0">
				<h3 class="truncate text-lg font-bold">{title}</h3>
				{#if subtitle}
					<p class="truncate text-sm font-medium text-(--app-muted)">{subtitle}</p>
				{/if}
			</div>
		</div>

		{#if onDelete}
			<button
				type="button"
				aria-label="Remove account"
				onclick={() => onDelete(entry.id)}
				class="neo-btn neo-btn-ghost neo-btn-icon text-(--app-accent-alt)"
			>
				<i class="fa-solid fa-trash-can"></i>
			</button>
		{/if}
	</div>

	<div class="mt-5 flex flex-col gap-4">
		<button
			type="button"
			onclick={copyCode}
			class="neo-code group min-h-16 w-full rounded-none text-left active:bg-(--app-accent)/35 sm:min-h-0 sm:w-auto {compact
				? 'text-3xl'
				: 'text-4xl sm:text-4xl'}"
			aria-label="Copy code"
		>
			{code.slice(0, 3)}
			{code.slice(3)}
			<span
				class="mt-1 block font-sans text-xs font-bold text-(--app-muted) group-active:text-(--app-text)"
			>
				{#if copied}
					Copied
				{:else}
					Tap code to copy
				{/if}
			</span>
		</button>
		<div class="flex flex-col gap-2">
			<CopyButton text={code} label="Copy code" />
			<div class="flex w-full items-center gap-2">
				<div class="neo-timer-track flex-1">
					<div
						class="neo-timer-fill linear transition-[width] duration-1000 {urgent
							? 'bg-(--app-accent-alt)!'
							: ''}"
						style="width: {(remaining / entry.period) * 100}%"
					></div>
				</div>
				<span class="text-xs font-bold tabular-nums {urgent ? 'text-(--app-accent-alt)' : ''}">
					{remaining}s
				</span>
			</div>
		</div>
	</div>
</article>
