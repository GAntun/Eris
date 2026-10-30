export interface YoutubeMeta {
    id: string;
    title: string;
    author: string;
    thumbnail: string;
}

interface OEmbedResponse {
    title?: string;
    author_name?: string;
    thumbnail_url?: string;
}

const FETCH_TIMEOUT_MS = 4000;

const YT_SHORT_RE = /\b(?:https?:\/\/)?(?:www\.)?youtu\.be\/([A-Za-z0-9_-]{11})/i;
const YT_FULL_RE = /\b(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtube\.com\/(?:watch\?(?:[^&\s]*&)*v=|embed\/|shorts\/|live\/|v\/)([A-Za-z0-9_-]{11})/i;

/**
 * Extracts a YouTube video ID from a message.
 *
 * @param text - Message body that may contain a YouTube link.
 * @returns The 11-character video ID, or `null` when no supported URL is found.
 * @remarks
 * Supports `youtu.be` links plus full YouTube watch, embed, shorts, live, and `v/` URLs.
 */
function extractYoutubeId(text: string): string | null {
    const short = text.match(YT_SHORT_RE);
    if (short) return short[1];
    const full = text.match(YT_FULL_RE);
    return full ? full[1] : null;
}

/**
 * Fetches public metadata for a YouTube video through the oEmbed endpoint.
 *
 * @param id - YouTube video ID to look up.
 * @returns A promise resolving to the video metadata, or `null` on failure.
 * @remarks
 * The request is aborted after {@link FETCH_TIMEOUT_MS}; missing fields are
 * normalized to empty strings so callers can render the result safely.
 */
async function getVideoMeta(id: string): Promise<YoutubeMeta | null> {
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
        const data = await res.json() as OEmbedResponse;
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

/**
 * Extracts a YouTube video ID from text and fetches its metadata.
 *
 * @param text - Message body that may contain a YouTube link.
 * @returns A promise resolving to video metadata, or `null` when no video is found.
 */
async function extractYoutube(text: string): Promise<YoutubeMeta | null> {
    const id = extractYoutubeId(text);
    if (!id) return null;
    return getVideoMeta(id);
}

export { extractYoutube, extractYoutubeId };
