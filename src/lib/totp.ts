export function parseOtpAuthUri(uri: string): {
	secret: string;
	name: string;
	issuer: string | null;
	digits: number;
	period: number;
	algorithm: string;
} | null {
	try {
		const url = new URL(uri.trim());
		if (url.protocol !== 'otpauth:' || url.hostname !== 'totp') return null;

		const secret = url.searchParams.get('secret');
		if (!secret) return null;

		const issuerParam = url.searchParams.get('issuer');
		const pathLabel = decodeURIComponent(url.pathname.replace(/^\//, ''));
		let name = pathLabel;
		let issuer = issuerParam;

		if (pathLabel.includes(':')) {
			const [maybeIssuer, account] = pathLabel.split(':');
			if (!issuer) issuer = maybeIssuer;
			name = account;
		}

		return {
			secret: secret.replace(/\s/g, '').toUpperCase(),
			name: name || 'Account',
			issuer,
			digits: Number(url.searchParams.get('digits') ?? 6),
			period: Number(url.searchParams.get('period') ?? 30),
			algorithm: (url.searchParams.get('algorithm') ?? 'SHA1').toUpperCase()
		};
	} catch {
		return null;
	}
}

export function issuerColor(issuer: string | null): string {
	const palette = ['#FFE066', '#FF6B6B', '#4ECDC4', '#FF49DB', '#7B61FF', '#00E5FF', '#CCFF00'];
	if (!issuer) return palette[0];
	let hash = 0;
	for (let i = 0; i < issuer.length; i++) {
		hash = issuer.charCodeAt(i) + ((hash << 5) - hash);
	}
	return palette[Math.abs(hash) % palette.length];
}

export interface TotpEntry {
	id: string;
	user_id: string;
	name: string;
	issuer: string | null;
	secret: string;
	digits: number;
	period: number;
	algorithm: string;
	sort_order: number;
	created_at: string;
}

function base32Decode(input: string): Uint8Array {
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	const cleaned = input.replace(/\s/g, '').replace(/=+$/, '').toUpperCase();
	let bits = '';
	for (const char of cleaned) {
		const val = alphabet.indexOf(char);
		if (val === -1) throw new Error('Invalid Base32 secret');
		bits += val.toString(2).padStart(5, '0');
	}
	const byteCount = Math.floor(bits.length / 8);
	const bytes = new Uint8Array(byteCount);
	for (let i = 0; i < byteCount; i++) {
		bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
	}
	return bytes;
}

function counterToBytes(counter: number): Uint8Array {
	const buf = new ArrayBuffer(8);
	const view = new DataView(buf);
	view.setBigUint64(0, BigInt(counter), false);
	return new Uint8Array(buf);
}

async function hmacSha1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
	const cryptoKey = await crypto.subtle.importKey(
		'raw',
		key.buffer.slice(key.byteOffset, key.byteOffset + key.byteLength) as ArrayBuffer,
		{ name: 'HMAC', hash: 'SHA-1' },
		false,
		['sign']
	);
	const sig = await crypto.subtle.sign(
		'HMAC',
		cryptoKey,
		message.buffer.slice(message.byteOffset, message.byteOffset + message.byteLength) as ArrayBuffer
	);
	return new Uint8Array(sig);
}

export async function generateTotp(
	secret: string,
	period = 30,
	digits = 6,
	now = Date.now()
): Promise<string> {
	const key = base32Decode(secret);
	const counter = Math.floor(now / 1000 / period);
	const hmac = await hmacSha1(key, counterToBytes(counter));
	const offset = hmac[hmac.length - 1] & 0x0f;
	const binary =
		((hmac[offset] & 0x7f) << 24) |
		((hmac[offset + 1] & 0xff) << 16) |
		((hmac[offset + 2] & 0xff) << 8) |
		(hmac[offset + 3] & 0xff);
	return (binary % 10 ** digits).toString().padStart(digits, '0');
}

export function totpRemainingSeconds(period = 30, now = Date.now()): number {
	const epoch = Math.floor(now / 1000);
	return period - (epoch % period);
}

export type ParsedOtpAuth = NonNullable<ReturnType<typeof parseOtpAuthUri>>;

export function isValidBase32(secret: string): boolean {
	return /^[A-Z2-7]+=*$/.test(secret.replace(/\s/g, '').toUpperCase());
}

export function normalizeSecret(secret: string): string {
	return secret.replace(/\s/g, '').toUpperCase();
}

export function accountLabel(entry: Pick<TotpEntry, 'name' | 'issuer'>): {
	title: string;
	subtitle: string | null;
} {
	if (entry.issuer) {
		return { title: entry.issuer, subtitle: entry.name };
	}
	return { title: entry.name, subtitle: null };
}
