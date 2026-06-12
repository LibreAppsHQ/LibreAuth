<script lang="ts">
	import MarketingHeader from '$lib/components/MarketingHeader.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import FaqList from '$lib/components/FaqList.svelte';
	import CtaBand from '$lib/components/CtaBand.svelte';

	type Row = { feature: string; libre: string; google: string; authy: string };

	const rows: Row[] = [
		{ feature: 'Open source', libre: 'yes', google: 'no', authy: 'no' },
		{ feature: 'Web app (no install)', libre: 'yes', google: 'partial', authy: 'partial' },
		{ feature: 'Self-hostable', libre: 'yes', google: 'no', authy: 'no' },
		{ feature: 'Cloud backup', libre: 'yes', google: 'yes', authy: 'yes' },
		{ feature: 'No phone number required', libre: 'yes', google: 'yes', authy: 'no' },
		{ feature: 'Design with opinions', libre: 'yes', google: 'no', authy: 'no' },
		{ feature: 'Auditable codebase', libre: 'yes', google: 'no', authy: 'no' },
		{ feature: 'Multi-device sync', libre: 'yes', google: 'yes', authy: 'yes' },
		{ feature: 'Offline code generation', libre: 'yes', google: 'yes', authy: 'partial' },
		{ feature: 'Push / SMS 2FA', libre: 'no', google: 'no', authy: 'yes' },
		{ feature: 'Account recovery via Authy', libre: 'no', google: 'no', authy: 'yes' },
		{ feature: 'Free forever tier', libre: 'yes', google: 'yes', authy: 'yes' }
	];

	const verdicts = [
		{
			title: 'Pick LibreAuth if…',
			color: 'var(--app-accent)',
			points: [
				'You want open source you can audit',
				'You hate bland security UI',
				'You need self-hosting option',
				'You prefer web + PWA over app store'
			]
		},
		{
			title: 'Pick Google Auth if…',
			color: 'var(--app-accent-alt2)',
			points: [
				'You want dead-simple mobile-only setup',
				'You trust Google ecosystem fully',
				'You do not care about source access'
			]
		},
		{
			title: 'Pick Authy if…',
			color: 'var(--app-accent-alt)',
			points: [
				'You need SMS/push-based 2FA',
				'You want Twilio-backed account recovery',
				'You are fine with closed source'
			]
		}
	];

	function cell(value: string) {
		if (value === 'yes') return { icon: 'fa-check', class: 'text-[#22c55e]' };
		if (value === 'no') return { icon: 'fa-xmark', class: 'text-[#ef4444]' };
		return { icon: 'fa-minus', class: 'text-(--app-muted)' };
	}
	const compareFaqs = [
		{
			q: 'Can I migrate from Google Authenticator?',
			a: 'Yes, if your export method provides otpauth URIs. Paste them into LibreAuth add flow.'
		},
		{
			q: 'Is LibreAuth less secure because it is web-based?',
			a: 'Web apps can be secure when codes generate client-side and sessions use HTTP-only cookies. Audit the source if you want proof.'
		},
		{
			q: 'Why not just use Authy?',
			a: 'Authy is fine if you want closed source and Twilio dependency. LibreAuth is for people who want control and transparency.'
		}
	];
</script>

<SeoHead
	title="Compare — Google Authenticator & Authy Alternative"
	description="Compare LibreAuth vs Google Authenticator and Authy: open source, self-hostable, web-based TOTP with sync and a design that stands out."
	breadcrumbs={[
		{ name: 'Home', path: '/' },
		{ name: 'Compare', path: '/compare' }
	]}
	faqs={compareFaqs}
/>

<div class="neo-shell">
	<MarketingHeader title="Compare" />

	<main class="mx-auto max-w-[960px] px-4 py-12 sm:px-6">
		<div class="neo-card p-8 text-center">
			<p class="text-base leading-7 font-medium text-(--app-muted)">
				Honest chart — no affiliate links, no sponsored rankings. Partial means limited or
				platform-dependent. We built LibreAuth because the alternatives felt stuck in 2014.
			</p>
		</div>

		<div class="neo-card mt-8 overflow-x-auto p-0">
			<table class="w-full min-w-[640px] text-left text-sm">
				<thead>
					<tr class="border-b-[3px] border-(--app-border) bg-(--app-accent)">
						<th class="px-4 py-3 font-bold">Feature</th>
						<th class="px-4 py-3 font-bold">LibreAuth</th>
						<th class="px-4 py-3 font-bold">Google Auth</th>
						<th class="px-4 py-3 font-bold">Authy</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as row, i}
						<tr class="border-b-[3px] border-(--app-border) {i % 2 ? 'bg-(--app-hover)' : ''}">
							<td class="px-4 py-3 font-semibold">{row.feature}</td>
							{#each [row.libre, row.google, row.authy] as value}
								{@const c = cell(value)}
								<td class="px-4 py-3">
									<i class="fa-solid {c.icon} {c.class} text-lg"></i>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<section class="mt-12 grid gap-5 md:grid-cols-3">
			{#each verdicts as v}
				<div class="neo-card overflow-hidden">
					<div class="border-b-[3px] border-(--app-border) px-5 py-4" style="background: {v.color}">
						<h3 class="font-bold">{v.title}</h3>
					</div>
					<ul class="space-y-2 p-5 text-sm font-medium">
						{#each v.points as point}
							<li class="flex gap-2 text-(--app-muted)">
								<i class="fa-solid fa-chevron-right mt-1 shrink-0 text-xs"></i>
								{point}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</section>

		<section class="mt-12">
			<h2 class="neo-heading mb-5 text-xl font-bold">Compare FAQ</h2>
			<FaqList items={compareFaqs} />
		</section>

		<CtaBand title="Convinced?" primary={{ href: '/app/register', label: 'Switch to LibreAuth' }} />
	</main>

	<SiteFooter />
</div>
