import { env } from '$env/dynamic/public';

export function getTurnstileSiteKey(): string {
	return env.PUBLIC_TURNSTILE_SITE_KEY ?? '';
}

export function isTurnstileEnabled(): boolean {
	return Boolean(getTurnstileSiteKey());
}

let scriptPromise: Promise<void> | null = null;

export function loadTurnstileScript(): Promise<void> {
	if (typeof window === 'undefined') {
		return Promise.resolve();
	}

	if (window.turnstile) {
		return Promise.resolve();
	}

	if (!scriptPromise) {
		scriptPromise = new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
			script.async = true;
			script.defer = true;
			script.onload = () => resolve();
			script.onerror = () => reject(new Error('Failed to load Turnstile'));
			document.head.appendChild(script);
		});
	}

	return scriptPromise;
}
