const ISSUER_DOMAINS: Record<string, string> = {
	github: 'github.com/Arcbasehq/LibreAuth',
	gitlab: 'gitlab.com',
	bitbucket: 'bitbucket.org',
	google: 'google.com',
	microsoft: 'microsoft.com',
	azure: 'azure.com',
	aws: 'aws.amazon.com',
	amazon: 'amazon.com',
	discord: 'discord.com',
	slack: 'slack.com',
	facebook: 'facebook.com',
	meta: 'meta.com',
	instagram: 'instagram.com',
	apple: 'apple.com',
	icloud: 'icloud.com',
	twitter: 'x.com',
	x: 'x.com',
	linkedin: 'linkedin.com',
	reddit: 'reddit.com',
	twitch: 'twitch.tv',
	steam: 'steampowered.com',
	dropbox: 'dropbox.com',
	notion: 'notion.so',
	linear: 'linear.app',
	vercel: 'vercel.com',
	supabase: 'supabase.com',
	cloudflare: 'cloudflare.com',
	digitalocean: 'digitalocean.com',
	stripe: 'stripe.com',
	paypal: 'paypal.com',
	coinbase: 'coinbase.com',
	binance: 'binance.com',
	proton: 'proton.me',
	protonmail: 'proton.me',
	bitwarden: 'bitwarden.com',
	'1password': '1password.com',
	okta: 'okta.com',
	auth0: 'auth0.com',
	figma: 'figma.com',
	shopify: 'shopify.com',
	wordpress: 'wordpress.com',
	hetzner: 'hetzner.com',
	namecheap: 'namecheap.com'
};

function normalizeKey(value: string): string {
	return value.trim().toLowerCase();
}

function domainFromIssuer(issuer: string): string | null {
	const key = normalizeKey(issuer);
	if (ISSUER_DOMAINS[key]) return ISSUER_DOMAINS[key];

	if (key.includes('.')) {
		return key.replace(/^https?:\/\//, '').split('/')[0] ?? null;
	}

	const slug = key.replace(/[^a-z0-9]/g, '');
	return slug ? `${slug}.com` : null;
}

function domainFromName(name: string): string | null {
	const trimmed = name.trim();
	if (!trimmed.includes('@')) return null;
	const domain = trimmed.split('@')[1]?.toLowerCase();
	return domain && domain.includes('.') ? domain : null;
}

export function issuerDomain(issuer: string | null, name: string): string | null {
	if (issuer?.trim()) {
		const fromIssuer = domainFromIssuer(issuer);
		if (fromIssuer) return fromIssuer;
	}

	return domainFromName(name);
}

export function issuerInitial(issuer: string | null, name: string): string {
	return (issuer ?? name).slice(0, 1).toUpperCase();
}

export function issuerFaviconUrl(issuer: string | null, name: string, size = 128): string | null {
	const domain = issuerDomain(issuer, name);
	if (!domain) return null;
	return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}
