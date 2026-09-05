const FETCH_TIMEOUT_MS = 4000;

const YT_SHORT_RE = /\b(?:https?:\/\/)?(?:www\.)?youtu\.be\/([A-Za-z0-9_-]{11})/i;
const YT_FULL_RE = /\b(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtube\.com\/(?:watch\?(?:[^&\s]*&)*v=|embed\/|shorts\/|live\/|v\/)([A-Za-z0-9_-]{11})/i;

function extractYoutubeId(text) {
    const short = text.match(YT_SHORT_RE);
    if (short) return short[1];
    const full = text.match(YT_FULL_RE);
    return full ? full[1] : null;
}

async function getVideoMeta(id) {
    const oembedUrl = 'https://www.youtube.com/oembed?format=json&url='
        + encodeURIComponent('https://www.youtube.com/watch?v=' + id);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
        const res = await fetch(oembedUrl, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) return null;
        const data = await res.json();
        return {
            id,
            title: data.title || '',
            author: data.author_name || '',
            thumbnail: data.thumbnail_url || ''
        };
    } catch (err) {
        return null;
    } finally {
        clearTimeout(timer);
    }
}

async function extractYoutube(text) {
    const id = extractYoutubeId(text);
    if (!id) return null;
    return getVideoMeta(id);
}

module.exports = { extractYoutube, extractYoutubeId };