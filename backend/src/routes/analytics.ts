import { Router, Request, Response } from "express";

//Queries
import { getYouTubeData, getTikTokData } from "../queries/platforms.js";

//Constants
import { creatorData } from "../constants/creatorData.js";

const router = Router();

const SOCIAVAULT_API_KEY = process.env.SOCIAVAULT_API_KEY;

const SUPPORTED_PLATFORMS = ["youtube", "tiktok"] as const;
const TOP_PERFORMERS_LIMIT = 10;

function parsePlatformQuery(platform: unknown): string[] {
  if (platform === undefined || platform === null) {
    return ["youtube"];
  }
  const arr = Array.isArray(platform) ? platform : [platform];
  return arr.flatMap((p) =>
    typeof p === "string"
      ? p.split(",").map((s) => s.trim().toLowerCase())
      : [],
  );
}

router.get("/analytics", async (req: Request, res: Response) => {
  if (!SOCIAVAULT_API_KEY) {
    return res.status(500).json({
      error: "Server misconfiguration",
      message: "SOCIAVAULT_API_KEY is not set",
    });
  }

  const platforms = parsePlatformQuery(req.query.platforms);

  console.log("platforms", platforms);

  let creatorAnalytics: any = {};

  for (const creator of creatorData) {
    console.log("creator", creator);

    let analytics: any = {
      id: creator.id,
      name: creator.name,
      youtubeFollowers: 0,
      youtubeViews: 0,
      tikTokFollowers: 0,
      tikTokViews: 0,
    };

    for (const platform of platforms) {
      if (platform === "youtube") {
        const youtubeData = await getYouTubeData(
          SOCIAVAULT_API_KEY,
          creator.youtubeChannelId,
        );

        analytics.youtubeFollowers = youtubeData.subscriberCount;
        analytics.youtubeViews = youtubeData.viewCount;
      }

      if (platform === "tiktok") {
        const tikTokData = await getTikTokData(
          SOCIAVAULT_API_KEY,
          creator.tiktokHandle,
        );

        analytics.tikTokFollowers = tikTokData.subscriberCount;
        analytics.tikTokViews = tikTokData.viewCount;
      }
    }

    console.log("analytics", analytics);

    creatorAnalytics[creator.id] = analytics;
  }

  let creatorTotals = [];

  for (const analytics of Object.values(creatorAnalytics)) {
    console.log("analytics", analytics);

    creatorTotals.push({
      id: analytics.id,
      name: analytics.name,
      followers: analytics.youtubeFollowers + analytics.tikTokFollowers,
      engagement: analytics.youtubeViews + analytics.tikTokViews,
    });
  }

  res.json({ creatorTotals });
});

export default router;
