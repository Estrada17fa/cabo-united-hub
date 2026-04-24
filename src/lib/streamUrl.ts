export type StreamPlatform = "youtube" | "facebook";

export interface EmbedInfo {
  platform: StreamPlatform;
  embedUrl: string;
}

/**
 * Parse a public YouTube or Facebook live URL and return an embeddable iframe URL.
 * Returns null if the URL is empty or the format is not recognized.
 */
export function getEmbedUrl(url: string | null | undefined): EmbedInfo | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // YouTube patterns
  // https://www.youtube.com/watch?v=ID
  // https://youtu.be/ID
  // https://www.youtube.com/live/ID
  // https://www.youtube.com/embed/ID
  const ytPatterns: RegExp[] = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([A-Za-z0-9_-]{6,})/,
    /youtu\.be\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/live\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/,
  ];
  for (const re of ytPatterns) {
    const m = trimmed.match(re);
    if (m && m[1]) {
      return {
        platform: "youtube",
        embedUrl: `https://www.youtube.com/embed/${m[1]}?autoplay=1&mute=1&playsinline=1&rel=0`,
      };
    }
  }

  // Facebook patterns:
  // https://www.facebook.com/<page>/videos/<id>
  // https://fb.watch/<id>
  // https://www.facebook.com/watch/?v=<id>
  if (/facebook\.com\/.+\/videos\/|fb\.watch\/|facebook\.com\/watch\/?\?v=/.test(trimmed)) {
    const encoded = encodeURIComponent(trimmed);
    return {
      platform: "facebook",
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encoded}&autoplay=1&mute=1&show_text=false`,
    };
  }

  return null;
}