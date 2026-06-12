import { writable } from 'svelte/store';

export interface Theme {
	name: string;
	description: string;
	background: string;
	panel: string;
	accent: string;
	accentAlt: string;
	accentAlt2: string;
	text: string;
	border: string;
	shadow: string;
	muted: string;
	onAccent: string;
	dark: boolean;
}

export const themes = {
	zine: {
		name: 'Zine',
		description: 'Warm newsprint with yellow stamp energy.',
		background: '#fff4d6',
		panel: '#ffffff',
		accent: '#ffe066',
		accentAlt: '#ff6b6b',
		accentAlt2: '#4ecdc4',
		text: '#0a0a0a',
		border: '#0a0a0a',
		shadow: '#0a0a0a',
		muted: '#4a4a4a',
		onAccent: '#0a0a0a',
		dark: false
	},
	ink: {
		name: 'Ink',
		description: 'Clean paper, cyan highlighter, red markup.',
		background: '#f5f5f0',
		panel: '#ffffff',
		accent: '#00e5ff',
		accentAlt: '#ff3366',
		accentAlt2: '#ffe066',
		text: '#0a0a0a',
		border: '#0a0a0a',
		shadow: '#0a0a0a',
		muted: '#555555',
		onAccent: '#0a0a0a',
		dark: false
	},
	voltage: {
		name: 'Voltage',
		description: 'Black room, lime glow, white wireframe.',
		background: '#141414',
		panel: '#1e1e1e',
		accent: '#ccff00',
		accentAlt: '#ff49db',
		accentAlt2: '#00e5ff',
		text: '#fafafa',
		border: '#fafafa',
		shadow: '#ccff00',
		muted: '#a0a0a0',
		onAccent: '#0a0a0a',
		dark: true
	},
	bubble: {
		name: 'Bubble',
		description: 'Lavender desk, pink sticker, purple shadow.',
		background: '#e8deff',
		panel: '#ffffff',
		accent: '#ff49db',
		accentAlt: '#7b61ff',
		accentAlt2: '#ffe066',
		text: '#0a0a0a',
		border: '#0a0a0a',
		shadow: '#7b61ff',
		muted: '#444444',
		onAccent: '#0a0a0a',
		dark: false
	}
} as const;

type ThemeKey = keyof typeof themes;

function applyThemeStyles(themeKey: ThemeKey) {
	if (typeof document === 'undefined') return;
	const palette = themes[themeKey];
	const root = document.documentElement;

	root.style.setProperty('--app-background', palette.background);
	root.style.setProperty('--app-panel', palette.panel);
	root.style.setProperty('--app-elevated', palette.panel);
	root.style.setProperty('--app-card', palette.panel);
	root.style.setProperty('--app-accent', palette.accent);
	root.style.setProperty('--app-accent-alt', palette.accentAlt);
	root.style.setProperty('--app-accent-alt2', palette.accentAlt2);
	root.style.setProperty('--app-on-accent', palette.onAccent);
	root.style.setProperty('--app-text', palette.text);
	root.style.setProperty('--app-muted', palette.muted);
	root.style.setProperty('--app-secondary', palette.text);
	root.style.setProperty('--app-border', palette.border);
	root.style.setProperty('--app-shadow-color', palette.shadow);
	root.style.setProperty('--app-surface', palette.panel);
	root.style.setProperty(
		'--app-hover',
		palette.dark ? '#2a2a2a' : colorMix(palette.accent, palette.background, 35)
	);
	root.style.setProperty('--app-skeleton', palette.dark ? '#2a2a2a' : '#e8dcc0');
	root.style.setProperty('--app-skeleton-shine', palette.dark ? '#333333' : palette.background);
	root.style.setProperty('--app-button', palette.text);
	root.style.setProperty('--app-button-hover', palette.text);
	root.dataset.theme = themeKey;
	document.querySelector('meta[name="theme-color"]')?.setAttribute('content', palette.background);
}

function colorMix(a: string, b: string, pct: number) {
	return `color-mix(in srgb, ${a} ${pct}%, ${b})`;
}

function createThemeStore() {
	let initialized = false;
	const { subscribe, set } = writable<ThemeKey>('zine');

	return {
		subscribe,
		load: () => {
			if (initialized || typeof window === 'undefined') return;
			initialized = true;

			const stored = window.localStorage.getItem('LibreAuth:theme');
			const legacy = stored === 'dark' ? 'voltage' : stored === 'light' ? 'ink' : stored;
			if (legacy && legacy in themes) {
				const themeKey = legacy as ThemeKey;
				set(themeKey);
				applyThemeStyles(themeKey);
			} else {
				applyThemeStyles('zine');
			}
		},
		setTheme: (themeKey: ThemeKey) => {
			set(themeKey);
			applyThemeStyles(themeKey);
			if (typeof window !== 'undefined') {
				window.localStorage.setItem('LibreAuth:theme', themeKey);
			}
		}
	};
}

export const themeStore = createThemeStore();
export const themeKeys = Object.keys(themes) as ThemeKey[];
export type { ThemeKey };
