import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const STORAGE_KEY = 'LibreAuth:settings';

export type AddTab = 'scan' | 'paste' | 'manual';
export const TOTP_PERIOD_OPTIONS = [15, 30, 45, 60] as const;
export type TotpPeriod = (typeof TOTP_PERIOD_OPTIONS)[number];

export interface AppSettings {
	reduceMotion: boolean;
	copyVibrate: boolean;
	compactVault: boolean;
	showIssuerLogos: boolean;
	defaultAddTab: AddTab;
	defaultPeriod: TotpPeriod;
}

const defaults: AppSettings = {
	reduceMotion: false,
	copyVibrate: true,
	compactVault: false,
	showIssuerLogos: false,
	defaultAddTab: 'scan',
	defaultPeriod: 30
};

function normalizePeriod(value: unknown): TotpPeriod {
	const n = Number(value);
	return TOTP_PERIOD_OPTIONS.includes(n as TotpPeriod) ? (n as TotpPeriod) : 30;
}

function readStorage(): AppSettings {
	if (!browser) return defaults;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return defaults;
		const parsed = JSON.parse(raw);
		return {
			...defaults,
			...parsed,
			defaultPeriod: normalizePeriod(parsed.defaultPeriod)
		};
	} catch {
		return defaults;
	}
}

function persist(settings: AppSettings) {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	} catch {
		/* storage blocked */
	}
}

export function applySettings(settings: AppSettings) {
	if (typeof document === 'undefined') return;
	if (settings.reduceMotion) {
		document.documentElement.dataset.reduceMotion = '1';
	} else {
		delete document.documentElement.dataset.reduceMotion;
	}
}

function createSettingsStore() {
	let initialized = false;
	const { subscribe, update, set } = writable<AppSettings>(defaults);

	return {
		subscribe,
		load: () => {
			if (initialized || !browser) return;
			initialized = true;

			let settings = readStorage();
			if (
				!localStorage.getItem(STORAGE_KEY) &&
				window.matchMedia('(prefers-reduced-motion: reduce)').matches
			) {
				settings = { ...settings, reduceMotion: true };
			}

			set(settings);
			applySettings(settings);
		},
		updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
			update((current) => {
				const next = { ...current, [key]: value };
				persist(next);
				applySettings(next);
				return next;
			});
		},
		resetPreferences() {
			const next = { ...defaults, reduceMotion: getReduceMotionDefault() };
			set(next);
			persist(next);
			applySettings(next);
		}
	};
}

function getReduceMotionDefault(): boolean {
	if (!browser) return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const settingsStore = createSettingsStore();

export function shouldCopyVibrate(): boolean {
	return readStorage().copyVibrate;
}

export function getDefaultPeriod(): TotpPeriod {
	return readStorage().defaultPeriod;
}
