const cheerio = require('cheerio');
const dns = require('dns');
const net = require('net');

const MAX_BYTES = 512 * 1024;
const FETCH_TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map();

function isPrivateIPv4(ip) {
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

function isPrivateIPv6(ip) {
    const lower = ip.toLowerCase();
    if (lower === '::' || lower === '::1') return true;
    if (lower.startsWith('fe80:')) return true;
    if (lower.startsWith('fdf') || lower.startsWith('fec')) return true;
    if (lower.startsWith('ff')) return true;
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIPv4(mapped[1]);
    return false;
}

async function isPublicUrl(rawUrl) {
    let url;
    try {
        url = new URL(rawUrl);
    } catch (err) {
        return false;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (url.hostname === 'localhost' || url.hostname.endsWith('.local')) return false;
    let records;
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

function cleanUrl(raw) {
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

function findFirstUrl(text) {
    const match = /\b(?:https?:\/\/|www\.)[^\s<]+/gi.exec(text);
    if (!match) return null;
    const url = cleanUrl(match[0]);
    if (!url || !/^https?:\/\//i.test(url) && !/^www\./i.test(url)) return null;
    return url.startsWith('www.') ? 'http://' + url : url;
}

async function readLimited(response, limit) {
    const reader = response.body.getReader();
    const chunks = [];
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

function toAbsolute(raw, base) {
    if (!raw) return null;
    if (/^data:/i.test(raw)) return raw;
    try {
        return new URL(raw, base).href;
    } catch (err) {
        return null;
    }
}

function pickOg($, finalUrl) {
    const meta = (p) => cheerioSelect($, p);
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

function cheerioSelect($, selector) {
    const attr = $(selector).attr('content');
    return attr ? String(attr).trim() : '';
}

function getFromCache(rawUrl) {
    const entry = cache.get(rawUrl);
    if (entry && entry.expiresAt > Date.now()) return entry.data;
    return undefined;
}

async function fetchOg(rawUrl) {
    const cached = getFromCache(rawUrl);
    if (cached !== undefined) return cached;

    let data = null;
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

async function extractLinkPreview(text) {
    const url = findFirstUrl(text);
    if (!url) return null;
    return fetchOg(url);
}

module.exports = { extractLinkPreview, findFirstUrl };