<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';

	let {
		active = true,
		onScan,
		onError
	} = $props<{
		active?: boolean;
		onScan: (text: string) => void;
		onError?: (message: string) => void;
	}>();

	const containerId = `qr-scanner-${Math.random().toString(36).slice(2, 9)}`;

	let status = $state<'idle' | 'starting' | 'scanning' | 'denied' | 'unsupported'>('idle');
	let scanner: import('html5-qrcode').Html5Qrcode | null = null;
	let ready = $state(false);
	let scanning = $state(false);
	let starting = false;

	async function stopScanner() {
		if (!scanner || !scanning) return;

		try {
			await scanner.stop();
		} catch {
			/* already stopped */
		}

		scanning = false;
		status = 'idle';
	}

	async function startScanner() {
		if (!browser || !scanner || !active || scanning || starting) return;

		starting = true;
		status = 'starting';

		try {
			await scanner.start(
				{ facingMode: 'environment' },
				{
					fps: 10,
					qrbox: (viewfinderWidth, viewfinderHeight) => {
						const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72);
						return { width: size, height: size };
					},
					aspectRatio: 1
				},
				(decodedText) => {
					onScan(decodedText);
				},
				() => {
					/* per-frame decode miss — ignore */
				}
			);
			scanning = true;
			status = 'scanning';
		} catch (err) {
			scanning = false;
			const message = err instanceof Error ? err.message : 'Could not start camera.';
			if (/not supported|secure context|https/i.test(message)) {
				status = 'unsupported';
			} else {
				status = 'denied';
			}
			onError?.(message);
		} finally {
			starting = false;
		}
	}

	onMount(async () => {
		if (!browser) return;

		if (!window.isSecureContext) {
			status = 'unsupported';
			onError?.('Camera requires HTTPS or localhost.');
			return;
		}

		const { Html5Qrcode } = await import('html5-qrcode');
		scanner = new Html5Qrcode(containerId, { verbose: false });
		ready = true;
	});

	onDestroy(async () => {
		await stopScanner();
		if (scanner) {
			try {
				await scanner.clear();
			} catch {
				/* ignore */
			}
		}
		scanner = null;
	});

	$effect(() => {
		if (!ready || !scanner) return;

		if (active) {
			startScanner();
		} else {
			stopScanner();
		}
	});
</script>

<div class="neo-card-flat overflow-hidden">
	<div class="border-b-[3px] border-(--app-border) bg-(--app-accent-alt2)/40 px-4 py-3">
		<p class="text-sm font-bold">
			{#if status === 'starting'}
				Starting camera…
			{:else if status === 'scanning'}
				<i class="fa-solid fa-qrcode mr-1"></i> Point at the setup QR code
			{:else if status === 'denied'}
				Camera blocked — allow access or use paste/manual below
			{:else if status === 'unsupported'}
				Camera unavailable here — use paste or manual entry
			{:else}
				Camera idle
			{/if}
		</p>
	</div>

	<div
		id={containerId}
		class="qr-scanner-view min-h-[min(62dvh,520px)] bg-black/90 sm:min-h-[320px]"
	></div>
</div>
