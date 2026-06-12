<script lang="ts">
	let {
		title = 'Ready to lock it down?',
		desc = 'Free account. No credit card. Codes in under a minute.',
		primary = { href: '/app/register', label: 'Create account' },
		secondary = { href: '/features', label: 'See features' }
	} = $props<{
		title?: string;
		desc?: string;
		primary?: { href: string; label: string };
		secondary?: { href: string; label: string };
	}>();
</script>

<section class="neo-card mt-16 overflow-hidden">
	<div class="grid md:grid-cols-[1fr_auto]">
		<div class="border-b-[3px] border-(--app-border) p-8 md:border-r-[3px] md:border-b-0">
			<span class="neo-badge neo-badge-alt">Get started</span>
			<h2 class="neo-heading mt-4 text-2xl font-bold sm:text-3xl">{title}</h2>
			<p class="mt-3 max-w-md text-sm leading-7 font-medium text-(--app-muted)">{desc}</p>
		</div>
		<div class="flex flex-col justify-center gap-3 p-8">
			<a href={primary.href} class="neo-btn neo-btn-primary w-full px-8 py-3 sm:w-auto"
				>{primary.label}</a
			>
			{#if secondary}
				<a href={secondary.href} class="neo-btn neo-btn-ghost w-full px-8 py-3 sm:w-auto"
					>{secondary.label}</a
				>
			{/if}
		</div>
	</div>
</section>
