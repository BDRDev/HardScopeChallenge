import type { CreatorItem } from "../services/sociavault.js";

const SOCIAVAULT_BASE_URL = "https://api.sociavault.com";

export async function getYouTubeData(
  apiKey: string,
  channelId: string,
): Promise<CreatorItem> {
  const url = `${SOCIAVAULT_BASE_URL}/v1/scrape/youtube/channel?channelId=${encodeURIComponent(channelId)}`;
  const response = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`SociaVault API error ${response.status}: ${errBody}`);
  }

  const json = (await response.json()) as {
    success?: boolean;
    data?: {
      channelId: string;
      name?: string;
      handle?: string;
      subscriberCount?: number;
      subscriberCountText?: string;
      viewCount?: number;
      viewCountText?: string;
      videoCount?: number;
      videoCountText?: string;
      description?: string;
      avatar?: unknown;
    };
  };

  const data = json?.data;
  if (!data) {
    throw new Error("No data in SociaVault response");
  }

  return {
    id: data.channelId,
    name: data.name ?? "Unknown",
    handle: data.handle ?? null,
    platform: "youtube",
    subscriberCount: data.subscriberCount ?? 0,
    subscriberCountText: data.subscriberCountText ?? null,
    viewCount: data.viewCount ?? 0,
    viewCountText: data.viewCountText ?? null,
    videoCount: data.videoCount ?? 0,
    videoCountText: data.videoCountText ?? null,
    description: data.description ?? null,
  };
}

export async function getTikTokData(
  apiKey: string,
  handle: string,
): Promise<CreatorItem> {
  const url = `${SOCIAVAULT_BASE_URL}/v1/scrape/tiktok/profile?handle=${encodeURIComponent(handle)}`;
  const response = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`SociaVault API error ${response.status}: ${errBody}`);
  }

  const json = (await response.json()) as {
    success?: boolean;
    data?: {
      user?: {
        id?: string;
        uniqueId?: string;
        nickname?: string;
        signature?: string;
      };
      stats?: {
        followerCount?: number;
        heartCount?: number;
        videoCount?: number;
      };
    };
  };

  const data = json?.data;
  const user = data?.user;
  const stats = data?.stats;

  if (!user) {
    throw new Error("No user data in SociaVault TikTok response");
  }

  const followerCount = stats?.followerCount ?? 0;
  const heartCount = stats?.heartCount ?? 0;
  const videoCount = stats?.videoCount ?? 0;

  return {
    id: user.id ?? user.uniqueId ?? handle,
    name: user.nickname ?? handle,
    handle: user.uniqueId ? `@${user.uniqueId}` : null,
    platform: "tiktok",
    subscriberCount: followerCount,
    subscriberCountText: formatCount(followerCount),
    viewCount: heartCount,
    viewCountText: formatCount(heartCount),
    videoCount,
    videoCountText: formatCount(videoCount),
    description: user.signature ?? null,
  };
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return String(n);
}
