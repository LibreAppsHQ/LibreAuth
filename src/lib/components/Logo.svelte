<script lang="ts">
	import logoText from '$lib/assets/logo-text.png';

	interface Props {
		class?: string;
		variant?: 'full' | 'mark';
	}
	let { class: className = '', variant = 'full' }: Props = $props();
</script>

{#if variant === 'mark'}
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class={className} aria-hidden="true">
		<rect
			x="3"
			y="3"
			width="42"
			height="42"
			fill="var(--app-accent)"
			stroke="var(--app-border)"
			stroke-width="3"
		/>
		<path
			d="M24 11c-4.97 0-9 4.03-9 9v4h-2.5a2.5 2.5 0 0 0-2.5 2.5v11A2.5 2.5 0 0 0 12.5 40h23a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 35.5 24H33v-4c0-4.97-4.03-9-9-9Zm0 5c2.21 0 4 1.79 4 4v4H20v-4c0-2.21 1.79-4 4-4Z"
			fill="var(--app-border)"
		/>
		<circle cx="24" cy="29" r="3" fill="var(--app-accent)" />
	</svg>
{:else}
	<img
		src={logoText}
		alt="LibreAuth"
		class="block w-auto max-w-full object-contain object-left {className}"
		decoding="async"
	/>
{/if}
