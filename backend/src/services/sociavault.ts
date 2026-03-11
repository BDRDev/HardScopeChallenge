import { creatorData } from "../constants/creatorData.js";
import { getYouTubeData, getTikTokData } from "../queries/platforms.js";

export type CreatorItem = {
  id: string;
  name: string;
  handle: string | null;
  platform: string;
  subscriberCount: number;
  subscriberCountText: string | null;
  viewCount: number;
  viewCountText: string | null;
  videoCount: number;
  videoCountText: string | null;
  description: string | null;
};

export async function getCreators(apiKey: string): Promise<CreatorItem[]> {
  const youtubeChannelIds = creatorData
    .map((c) => c.youtubeChannelId)
    .filter(Boolean);
  const tiktokHandles = creatorData
    .map((c) => c.tiktokHandle)
    .filter((h): h is string => Boolean(h));

  const [youtubeCreators, tiktokCreators] = await Promise.all([
    getYouTubeData(apiKey, youtubeChannelIds),
    getTikTokData(apiKey, tiktokHandles),
  ]);

  return [...youtubeCreators, ...tiktokCreators];
}
