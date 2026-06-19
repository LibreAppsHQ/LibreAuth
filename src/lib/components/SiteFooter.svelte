<script lang="ts">
	import { resolve } from '$app/paths';
	import Logo from '$lib/components/Logo.svelte';
	import { resetCookieConsent } from '$lib/stores/cookieConsent';
	import { APP_VERSION } from '$lib/version';

	const footerColumns = [
		{
			title: 'Product',
			links: [
				{ href: '/app', label: 'App' },
				{ href: '/features', label: 'Features' },
				{ href: '/compare', label: 'Compare' },
				{ href: '/pricing', label: 'Pricing' }
			]
		},
		{
			title: 'Company',
			links: [
				{ href: '/about', label: 'About' },
				{ href: '/security', label: 'Security' },
				{ href: '/privacy', label: 'Privacy' },
				{ action: 'cookies', label: 'Cookie settings' }
			]
		},
		{
			title: 'Account',
			links: [
				{ href: '/app/login', label: 'Sign in' },
				{ href: '/app/register', label: 'Register' }
			]
		}
	] as const;

	type FooterLink = (typeof footerColumns)[number]['links'][number];

	function linkKey(link: FooterLink) {
		return 'href' in link ? link.href : link.action;
	}
</script>

<footer class="neo-footer">
	<div class="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6">
		<div class="neo-card p-6 sm:p-8">
			<div class="flex flex-col gap-10 lg:flex-row lg:justify-between">
				<div class="max-w-sm space-y-4">
					<a href={resolve('/')}>
						<Logo class="h-10" />
					</a>
					<p class="text-sm leading-7 text-(--app-muted)">
						Neo-brutalist TOTP for people who hate boring security apps. Open source. No ads.
						Consent-based PostHog analytics.
					</p>
					<span class="neo-badge neo-badge-alt">v{APP_VERSION}</span>
				</div>

				<div class="grid grid-cols-2 gap-8 sm:grid-cols-3">
					{#each footerColumns as col (col.title)}
						<div>
							<p class="mb-3 text-[0.65rem] font-bold tracking-[0.14em] uppercase">{col.title}</p>
							<ul class="space-y-2 text-sm font-semibold">
								{#each col.links as link (linkKey(link))}
									<li>
										{#if 'action' in link}
											<button type="button" class="neo-link" onclick={resetCookieConsent}>
												{link.label}
											</button>
										{:else}
											<a href={resolve(link.href)} class="neo-link">{link.label}</a>
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			</div>

			<div
				class="mt-10 flex flex-col gap-3 border-t-[3px] border-(--app-border) pt-6 sm:flex-row sm:items-center sm:justify-between"
			>
				<p class="text-xs font-semibold text-(--app-muted)">
					&copy; {new Date().getFullYear()} LibreAuth — security with personality.
				</p>
				<a
					href="https://github.com/Arcbasehq/LibreAuth"
					target="_blank"
					rel="noopener noreferrer"
					class="neo-btn neo-btn-ghost neo-btn-icon"
					aria-label="GitHub"
				>
					<i class="fa-brands fa-github"></i>
				</a>
			</div>
		</div>
	</div>
</footer>
