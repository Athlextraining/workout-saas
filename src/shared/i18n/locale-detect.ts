import type { Locale } from './config';

const BOT_UA_RE = /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot/i;

export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return BOT_UA_RE.test(userAgent);
}

export function detectLocaleFromAcceptLanguage(
  header: string | null | undefined,
): Locale {
  if (!header) return 'es';
  const tags = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? Number(qParam.trim().slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((t) => t.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  if (tags.length === 0) return 'es';
  const primary = tags[0].tag;
  return primary.startsWith('es') ? 'es' : 'en';
}
