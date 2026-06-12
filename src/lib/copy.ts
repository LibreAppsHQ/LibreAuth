import { shouldCopyVibrate } from '$lib/stores/settings';

export async function copyText(text: string): Promise<boolean> {
	if (!text || text === '------') return false;

	try {
		await navigator.clipboard.writeText(text);
	} catch {
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.setAttribute('readonly', '');
		textarea.style.position = 'fixed';
		textarea.style.left = '-9999px';
		document.body.appendChild(textarea);
		textarea.select();
		const ok = document.execCommand('copy');
		document.body.removeChild(textarea);
		if (!ok) return false;
	}

	if ('vibrate' in navigator && shouldCopyVibrate()) {
		navigator.vibrate(15);
	}

	return true;
}
