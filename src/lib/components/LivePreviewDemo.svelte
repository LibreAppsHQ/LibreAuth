<script lang="ts">
	import { onMount } from 'svelte';
	import { generateTotp, totpRemainingSeconds } from '$lib/totp';

	const period = 30;

	const demoAccounts = [
		{ issuer: 'github.com/LibreAppsHQ/LibreAuth', name: 'you@mail.com', secret: 'JBSWY3DPEHPK3PXP' },
		{ issuer: 'google.com', name: 'you@gmail.com', secret: 'GEZDGNBVGY3TQOJQ' },
		{ issuer: 'aws.amazon.com', name: 'prod-admin', secret: 'MFRGGZDFMZTWQ2LK' },
		{ issuer: 'discord.com', name: 'stormz', secret: 'ONSWG4TFOQYTEMDD' }
	] as const;

	let accountIndex = $state(0);
	let code = $state('------');
	let remaining = $state(period);
	let codeFresh = $state(false);
	let interval: ReturnType<typeof setInterval> | undefined;
	let lastCounter = -1;

	const account = $derived(demoAccounts[accountIndex]);
	const urgent = $derived(remaining <= 5);
	const timerPercent = $derived((remaining / period) * 100);
	const formattedCode = $derived(code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code);

	async function tick() {
		const counter = Math.floor(Date.now() / 1000 / period);

		if (lastCounter !== -1 && counter !== lastCounter) {
			accountIndex = (accountIndex + 1) % demoAccounts.length;
			codeFresh = true;
			setTimeout(() => (codeFresh = false), 350);
		}
		lastCounter = counter;

		try {
			code = await generateTotp(account.secret, period, 6);
		} catch {
			code = '------';
		}
		remaining = totpRemainingSeconds(period);
	}

	onMount(() => {
		void tick();
		interval = setInterval(() => void tick(), 1000);
		return () => clearInterval(interval);
	});
</script>

<span class="neo-badge">Live preview</span>
<p class="neo-code neo-preview-code mt-6 text-5xl {codeFresh ? 'neo-preview-code-fresh' : ''}">
	{formattedCode}
</p>
<p class="mt-2 text-sm font-bold text-(--app-muted)">
	{account.issuer} · {account.name}
</p>
<div class="mt-4 flex max-w-xs items-center gap-2">
	<div class="neo-timer-track flex-1">
		<div
			class="neo-timer-fill linear transition-[width] duration-1000 {urgent
				? 'bg-(--app-accent-alt)!'
				: ''}"
			style="width: {timerPercent}%"
		></div>
	</div>
	<span class="text-xs font-bold tabular-nums {urgent ? 'text-(--app-accent-alt)' : ''}">
		{remaining}s
	</span>
</div>

<style>
	.neo-preview-code {
		transition:
			transform 0.25s ease,
			opacity 0.25s ease;
	}

	.neo-preview-code-fresh {
		animation: neo-preview-pop 0.35s cubic-bezier(0.34, 1.4, 0.64, 1);
	}

	@keyframes neo-preview-pop {
		from {
			opacity: 0.4;
			transform: scale(0.96) translateY(4px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	:global([data-reduce-motion]) .neo-preview-code-fresh {
		animation: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.neo-preview-code-fresh {
			animation: none;
		}

		.neo-timer-fill {
			transition: none !important;
		}
	}
</style>
