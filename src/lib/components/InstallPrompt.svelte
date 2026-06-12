<script lang="ts">
	import {
		dismissInstallPrompt,
		installPlatform,
		installPromptVisible,
		nativeInstallAvailable,
		triggerInstall
	} from '$lib/stores/installPrompt';

	let installing = $state(false);

	async function install() {
		installing = true;
		try {
			await triggerInstall();
		} finally {
			installing = false;
		}
	}
</script>

{#if $installPromptVisible}
	<div
		class="neo-install-prompt"
		role="dialog"
		aria-labelledby="install-prompt-title"
		aria-describedby="install-prompt-desc"
	>
		<div class="neo-install-prompt-inner neo-card-sm">
			<div class="flex items-start gap-3">
				<div
					class="flex h-11 w-11 shrink-0 items-center justify-center border-[3px] border-(--app-border) bg-(--app-accent) text-lg shadow-[3px_3px_0_var(--app-shadow-color)]"
					aria-hidden="true"
				>
					<i class="fa-solid fa-mobile-screen-button"></i>
				</div>

				<div class="min-w-0 flex-1">
					<p id="install-prompt-title" class="text-sm font-bold sm:text-base">
						Add LibreAuth to your home screen
					</p>
					<p id="install-prompt-desc" class="mt-2 text-sm leading-6 text-(--app-muted)">
						{#if $installPlatform === 'ios'}
							Install LibreAuth like an app for quick access to your codes — no browser chrome,
							works offline after load.
						{:else if $nativeInstallAvailable}
							Install LibreAuth for one-tap access to your vault from your home screen.
						{:else}
							Open your browser menu and choose <strong class="text-(--app-text)"
								>Install app</strong
							>
							or <strong class="text-(--app-text)">Add to Home screen</strong>.
						{/if}
					</p>

					{#if $installPlatform === 'ios'}
						<ol class="mt-3 space-y-2 text-sm font-semibold text-(--app-text)">
							<li class="flex items-center gap-2">
								<span
									class="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-(--app-border) bg-(--app-panel) text-xs"
									>1</span
								>
								Tap <i class="fa-solid fa-arrow-up-from-bracket px-1"></i> Share
							</li>
							<li class="flex items-center gap-2">
								<span
									class="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-(--app-border) bg-(--app-panel) text-xs"
									>2</span
								>
								Scroll and tap <strong>Add to Home Screen</strong>
							</li>
							<li class="flex items-center gap-2">
								<span
									class="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-(--app-border) bg-(--app-panel) text-xs"
									>3</span
								>
								Tap <strong>Add</strong>
							</li>
						</ol>
					{/if}

					<div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
						{#if $installPlatform === 'android' && $nativeInstallAvailable}
							<button
								type="button"
								onclick={install}
								disabled={installing}
								class="neo-btn neo-btn-primary w-full sm:w-auto"
							>
								{installing ? 'Installing…' : 'Install app'}
							</button>
						{/if}
						<button
							type="button"
							onclick={dismissInstallPrompt}
							class="neo-btn neo-btn-ghost w-full sm:w-auto"
						>
							Not now
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
