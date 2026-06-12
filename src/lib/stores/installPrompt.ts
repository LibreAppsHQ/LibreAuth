import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const DISMISS_KEY = 'LibreAuth:install-prompt-dismissed';

export type InstallPlatform = 'ios' | 'android' | 'other';

export const installPromptVisible = writable(false);
export const installPlatform = writable<InstallPlatform>('other');
export const nativeInstallAvailable = writable(false);

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
let initialized = false;

export function isStandalone(): boolean {
	if (!browser) return false;
	return (
		window.matchMedia('(display-mode: standalone)').matches ||
		(navigator as Navigator & { standalone?: boolean }).standalone === true
	);
}

function isMobileDevice(): boolean {
	if (!browser) return false;
	return (
		/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
		(navigator.maxTouchPoints > 1 && window.innerWidth < 1024)
	);
}

function detectPlatform(): InstallPlatform {
	if (!browser) return 'other';
	if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return 'ios';
	if (/Android/i.test(navigator.userAgent)) return 'android';
	return 'other';
}

function isDismissed(): boolean {
	try {
		return !!localStorage.getItem(DISMISS_KEY);
	} catch {
		return false;
	}
}

export function dismissInstallPrompt() {
	if (!browser) return;
	try {
		localStorage.setItem(DISMISS_KEY, new Date().toISOString());
	} catch {
		/* storage blocked */
	}
	installPromptVisible.set(false);
}

async function registerServiceWorker() {
	if (!('serviceWorker' in navigator)) return;
	try {
		await navigator.serviceWorker.register('/sw.js', { scope: '/' });
	} catch {
		/* optional — install still works on iOS without SW */
	}
}

export function initInstallPrompt() {
	if (!browser || initialized || isStandalone() || isDismissed() || !isMobileDevice()) {
		return;
	}

	initialized = true;
	const platform = detectPlatform();
	installPlatform.set(platform);

	void registerServiceWorker();

	if (platform === 'android') {
		window.addEventListener('beforeinstallprompt', (event) => {
			event.preventDefault();
			deferredInstallPrompt = event as BeforeInstallPromptEvent;
			nativeInstallAvailable.set(true);
			installPromptVisible.set(true);
		});

		window.setTimeout(() => {
			if (!deferredInstallPrompt && !isStandalone() && !isDismissed()) {
				installPromptVisible.set(true);
			}
		}, 2500);
		return;
	}

	if (platform === 'ios') {
		installPromptVisible.set(true);
	}
}

export async function triggerInstall(): Promise<'installed' | 'dismissed' | 'unavailable'> {
	if (!deferredInstallPrompt) return 'unavailable';

	await deferredInstallPrompt.prompt();
	const { outcome } = await deferredInstallPrompt.userChoice;
	deferredInstallPrompt = null;

	if (outcome === 'accepted') {
		installPromptVisible.set(false);
		return 'installed';
	}

	return 'dismissed';
}
