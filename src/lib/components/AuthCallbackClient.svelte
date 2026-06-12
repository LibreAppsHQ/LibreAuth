<script lang="ts">
	import { browser } from '$app/environment';
	import { goto, invalidateAll } from '$app/navigation';
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import { onMount } from 'svelte';

	onMount(async () => {
		if (!browser || !window.location.hash.includes('access_token=')) return;

		const hash = new URLSearchParams(window.location.hash.slice(1));
		const type = hash.get('type');
		const next = type === 'recovery' ? '/app/reset-password' : '/app';

		const supabase = createSupabaseBrowserClient();
		const {
			data: { session }
		} = await supabase.auth.getSession();

		if (!session) return;

		if (type === 'recovery') {
			await fetch('/app/auth/recovery-session', { method: 'POST' });
		}

		history.replaceState(null, '', window.location.pathname + window.location.search);
		await invalidateAll();
		await goto(next);
	});
</script>
