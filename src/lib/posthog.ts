import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import posthog from 'posthog-js';

let initialized = false;

const BLOCKED_PREFIXES = ['/app/add', '/app/settings'];

export function getPostHogKey(): string {
	return env.PUBLIC_POSTHOG_KEY ?? '';
}

export function getPostHogHost(): string {
	return env.PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
}

export function isPostHogConfigured(): boolean {
	return Boolean(getPostHogKey());
}

export function isPostHogAllowedPath(pathname: string): boolean {
	if (pathname === '/app') return false;
	return !BLOCKED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function initPostHog(): boolean {
	if (!browser || initialized || !isPostHogConfigured()) return false;

	posthog.init(getPostHogKey(), {
		api_host: getPostHogHost(),
		defaults: '2026-05-30',
		capture_pageview: false,
		capture_pageleave: true,
		person_profiles: 'identified_only',
		persistence: 'localStorage+cookie',
		autocapture: false,
		disable_session_recording: true,
		before_send: (event) => {
			if (typeof window !== 'undefined' && !isPostHogAllowedPath(window.location.pathname)) {
				return null;
			}
			return event;
		}
	});

	initialized = true;
	return true;
}

export function shutdownPostHog() {
	if (!browser || !initialized) return;

	posthog.opt_out_capturing();
	posthog.reset();
	initialized = false;
}

export function capturePageview(pathname: string, search = '') {
	if (!initialized || !isPostHogAllowedPath(pathname)) return;

	posthog.capture('$pageview', {
		$current_url: `${pathname}${search}`
	});
}

export function identifyUser(user: { id: string; email?: string | null }) {
	if (!initialized) return;

	posthog.identify(user.id, {
		email: user.email ?? undefined
	});
}

export function resetPostHogUser() {
	if (!initialized) return;
	posthog.reset();
}

export function captureEvent(event: string, properties?: Record<string, unknown>) {
	if (!initialized) return;
	posthog.capture(event, properties);
}
