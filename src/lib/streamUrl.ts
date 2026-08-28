export type StreamPlatform = "youtube" | "facebook" | "twitch" | "vimeo";

export interface EmbedInfo {
  platform: StreamPlatform;
  embedUrl: string;
}

/**
 * Parse a public live/VOD URL (YouTube, Facebook, Twitch, Vimeo) and return an
 * embeddable iframe URL. Returns null when the URL is empty or not embeddable.
 */
export function getEmbedUrl(url: string | null | undefined): EmbedInfo | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // YouTube patterns
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

  // Facebook
  if (/facebook\.com\/.+\/videos\/|fb\.watch\/|facebook\.com\/watch\/?\?v=/.test(trimmed)) {
    const encoded = encodeURIComponent(trimmed);
    return {
      platform: "facebook",
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encoded}&autoplay=1&mute=1&show_text=false`,
    };
  }

  // Twitch (canal o video)
  const twitchVideo = trimmed.match(/twitch\.tv\/videos\/(\d+)/);
  if (twitchVideo) {
    return {
      platform: "twitch",
      embedUrl: `https://player.twitch.tv/?video=${twitchVideo[1]}&parent=${location.hostname}&autoplay=true&muted=true`,
    };
  }
  const twitchChannel = trimmed.match(/twitch\.tv\/([A-Za-z0-9_]{3,})/);
  if (twitchChannel) {
    return {
      platform: "twitch",
      embedUrl: `https://player.twitch.tv/?channel=${twitchChannel[1]}&parent=${location.hostname}&autoplay=true&muted=true`,
    };
  }

  // Vimeo
  const vimeo = trimmed.match(/vimeo\.com\/(?:event\/)?(\d+)/);
  if (vimeo) {
    return {
      platform: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&muted=1`,
    };
  }

  return null;
}
