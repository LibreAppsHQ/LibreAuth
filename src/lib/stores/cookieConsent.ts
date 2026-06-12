import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const STORAGE_KEY = 'LibreAuth:cookie-consent';

function hasConsent(): boolean {
	if (!browser) return false;
	try {
		return !!localStorage.getItem(STORAGE_KEY);
	} catch {
		return false;
	}
}

export const cookieConsentGiven = writable(false);

export function initCookieConsent() {
	const accepted = hasConsent();
	cookieConsentGiven.set(accepted);
	if (accepted && typeof document !== 'undefined') {
		document.documentElement.dataset.cookieConsent = '1';
	}
}

export function acceptCookies() {
	if (!browser) return;
	try {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ essential: true, acceptedAt: new Date().toISOString() })
		);
		document.documentElement.dataset.cookieConsent = '1';
	} catch {
		/* storage blocked — still hide for session */
	}
	cookieConsentGiven.set(true);
}

export function resetCookieConsent() {
	if (!browser) return;
	try {
		localStorage.removeItem(STORAGE_KEY);
		delete document.documentElement.dataset.cookieConsent;
	} catch {
		delete document.documentElement.dataset.cookieConsent;
	}
	cookieConsentGiven.set(false);
}
