import * as cheerio from 'cheerio';
import dns from 'dns';

export interface OgPreview {
    title: string | null;
    description: string | null;
    image: string | null;
    siteName: string | null;
    url: string;
}

interface CacheEntry {
    data: OgPreview | null;
    expiresAt: number;
}

const MAX_BYTES = 512 * 1024;
const FETCH_TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

/**
 * Determines whether an IPv4 address belongs to a private or reserved range.
 *
 * @param ip - Dotted-decimal IPv4 address to inspect.
 * @returns `true` when the address must not be fetched from, otherwise `false`.
 * @remarks
 * Used as an SSRF safeguard before following a user-supplied link.
 */
function isPrivateIPv4(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127 || a === 224) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a === 198 && (b === 18 || b === 19)) return true;
    if (a >= 240) return true;
    return false;
}

/**
 * Determines whether an IPv6 address belongs to a private or reserved range.
 *
 * @param ip - IPv6 address to inspect.
 * @returns `true` when the address must not be fetched from, otherwise `false`.
 * @remarks
 * IPv4-mapped IPv6 addresses are delegated to {@link isPrivateIPv4}.
 */
function isPrivateIPv6(ip: string): boolean {
    const lower = ip.toLowerCase();
    if (lower === '::' || lower === '::1') return true;
    if (lower.startsWith('fe80:')) return true;
    if (lower.startsWith('fdf') || lower.startsWith('fec')) return true;
    if (lower.startsWith('ff')) return true;
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIPv4(mapped[1]);
    return false;
}

/**
 * Checks that a URL is HTTP(S) and resolves only to public IP addresses.
 *
 * @param rawUrl - Absolute URL supplied by user content.
 * @returns A promise resolving to `true` when the URL is safe to fetch.
 * @remarks
 * DNS failures and local hostnames such as `localhost` or `*.local` are rejected.
 */
async function isPublicUrl(rawUrl: string): Promise<boolean> {
    let url: URL;
    try {
        url = new URL(rawUrl);
    } catch (err) {
        return false;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (url.hostname === 'localhost' || url.hostname.endsWith('.local')) return false;
    let records: dns.LookupAddress[];
    try {
        records = await dns.promises.lookup(url.hostname, { all: true });
    } catch (err) {
        return false;
    }
    if (!records || records.length === 0) return false;
    return records.every((r) => {
        if (r.family === 4) return !isPrivateIPv4(r.address);
        return !isPrivateIPv6(r.address);
    });
}

/**
 * Removes trailing whitespace, emoji, punctuation, and typographic marks from a URL.
 *
 * @param raw - Candidate URL extracted from message text.
 * @returns The cleaned URL without trailing non-URL characters.
 * @remarks
 * The cleanup repeats until the string stops changing so nested trailing
 * punctuation and emoji sequences are fully removed.
 */
function cleanUrl(raw: string): string {
    let out = raw;
    while (true) {
        const before = out;
        out = out.replace(/\s+$/, '')
            .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F300}-\u{1F5FF}\u2B00-\u2BFF]+$/u, '')
            .replace(/[.,!?;:)\]}»]+$/, '')
            .replace(/["'*_~`>]+$/, '')
            .replace(/\u2026+$/, '');
        if (out === before) break;
    }
    return out;
}

/**
 * Extracts the first HTTP(S) or `www.` URL from a message.
 *
 * @param text - Message body to search.
 * @returns A normalized absolute URL, or `null` when no valid URL is found.
 * @remarks
 * Bare `www.` URLs are normalized to use `http://`.
 */
function findFirstUrl(text: string): string | null {
    const match = /\b(?:https?:\/\/|www\.)[^\s<]+/gi.exec(text);
    if (!match) return null;
    const url = cleanUrl(match[0]);
    if (!url || (!/^https?:\/\//i.test(url) && !/^www\./i.test(url))) return null;
    return url.startsWith('www.') ? 'http://' + url : url;
}

/**
 * Reads a response body while enforcing a maximum byte limit.
 *
 * @param response - Fetch response whose body should be consumed.
 * @param limit - Maximum number of bytes allowed before aborting.
 * @returns A promise resolving to the decoded UTF-8 response body.
 * @throws An error when the response has no body or exceeds `limit`.
 * @remarks
 * Reading incrementally prevents a remote server from exhausting memory with a
 * very large HTML document.
 */
async function readLimited(response: Response, limit: number): Promise<string> {
    if (!response.body) throw new Error('Empty response body');
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        if (total > limit) throw new Error('Response too large');
        chunks.push(value);
    }
    return Buffer.concat(chunks).toString('utf8');
}

/**
 * Converts a possibly relative URL into an absolute URL.
 *
 * @param raw - URL value read from page metadata.
 * @param base - Base URL used to resolve relative paths.
 * @returns An absolute URL, the original `data:` URI, or `null` when invalid.
 * @remarks
 * Data URIs are returned unchanged so inline preview images remain usable.
 */
function toAbsolute(raw: string | null, base: string): string | null {
    if (!raw) return null;
    if (/^data:/i.test(raw)) return raw;
    try {
        return new URL(raw, base).href;
    } catch (err) {
        return null;
    }
}

/**
 * Builds a link preview from OpenGraph and HTML metadata.
 *
 * @param $ - Loaded Cheerio document for the fetched page.
 * @param finalUrl - Final URL after redirects, used as the fallback page URL.
 * @returns A populated {@link OgPreview}, or `null` when no title or image exists.
 * @remarks
 * OpenGraph tags take precedence over generic HTML `<title>` and description tags.
 */
function pickOg($: cheerio.CheerioAPI, finalUrl: string): OgPreview | null {
    const meta = (p: string) => cheerioSelect($, p);
    const image = meta('meta[property="og:image:secure_url"]')
        || meta('meta[property="og:image:url"]')
        || meta('meta[property="og:image"]');
    const title = meta('meta[property="og:title"]') || $('title').text().trim();
    const description = meta('meta[property="og:description"]') || meta('meta[name="description"]');
    const siteName = meta('meta[property="og:site_name"]');
    const ogUrl = meta('meta[property="og:url"]') || finalUrl;

    if (!title && !image) return null;

    return {
        title: title || null,
        description: description || null,
        image: toAbsolute(image, ogUrl),
        siteName: siteName || null,
        url: ogUrl
    };
}

/**
 * Reads the `content` attribute for the first element matching a selector.
 *
 * @param $ - Loaded Cheerio document to query.
 * @param selector - CSS selector identifying the metadata element.
 * @returns The trimmed attribute value, or an empty string when absent.
 */
function cheerioSelect($: cheerio.CheerioAPI, selector: string): string {
    const attr = $(selector).attr('content');
    return attr ? String(attr).trim() : '';
}

/**
 * Retrieves a cached link preview when it has not expired.
 *
 * @param rawUrl - URL used as the cache key.
 * @returns The cached preview, `null` for a cached negative result, or `undefined` on a miss.
 * @remarks
 * `null` and `undefined` are intentionally distinct so failed lookups can also be cached.
 */
function getFromCache(rawUrl: string): OgPreview | null | undefined {
    const entry = cache.get(rawUrl);
    if (entry && entry.expiresAt > Date.now()) return entry.data;
    return undefined;
}

/**
 * Fetches and parses OpenGraph metadata for a URL, using the in-memory cache.
 *
 * @param rawUrl - Absolute URL to inspect.
 * @returns A promise resolving to the preview data, or `null` when unavailable.
 * @remarks
 * The request times out after {@link FETCH_TIMEOUT_MS}, only HTML responses are
 * parsed, and successful previews are cached for {@link CACHE_TTL_MS}.
 */
async function fetchOg(rawUrl: string): Promise<OgPreview | null> {
    const cached = getFromCache(rawUrl);
    if (cached !== undefined) return cached;

    let data: OgPreview | null = null;
    if (await isPublicUrl(rawUrl)) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        try {
            const res = await fetch(rawUrl, {
                redirect: 'follow',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; ChatBot/1.0)',
                    'Accept': 'text/html'
                }
            });
            const contentType = res.headers.get('content-type') || '';
            if (res.ok && contentType.includes('text/html')) {
                const html = await readLimited(res, MAX_BYTES);
                const $ = cheerio.load(html);
                data = pickOg($, res.url || rawUrl);
            }
        } catch (err) {
            data = null;
        } finally {
            clearTimeout(timer);
        }
    }

    cache.set(rawUrl, { data, expiresAt: Date.now() + (data ? CACHE_TTL_MS : 5 * 60 * 1000) });
    return data;
}

/**
 * Extracts the first URL from a message and returns its link preview.
 *
 * @param text - Message body that may contain a link.
 * @returns A promise resolving to preview data, or `null` when no preview is available.
 */
async function extractLinkPreview(text: string): Promise<OgPreview | null> {
    const url = findFirstUrl(text);
    if (!url) return null;
    return fetchOg(url);
}

export { extractLinkPreview, findFirstUrl };
