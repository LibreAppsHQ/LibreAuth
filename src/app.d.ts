/// <reference types="@sveltejs/kit" />

declare global {
	interface Window {
		turnstile?: {
			render: (
				container: HTMLElement,
				options: {
					sitekey: string;
					theme?: 'auto' | 'light' | 'dark';
					callback?: (token: string) => void;
					'expired-callback'?: () => void;
					'error-callback'?: () => void;
				}
			) => string;
			reset: (widgetId?: string) => void;
			remove: (widgetId: string) => void;
		};
	}

	namespace App {
		interface Locals {
			safeGetSession: () => Promise<{
				session: import('@supabase/supabase-js').Session | null;
				user: import('@supabase/supabase-js').User | null;
			}>;
		}
	}
}

export {};
