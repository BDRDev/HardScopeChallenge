import { Router, Request, Response } from "express";

//Interfaces
import CreatorInterface from "../interfaces/Creator/CreatorInterface.js";

//Utils
import supabase from "../utils/supabase.js";
import { parsePlatformQuery } from "../utils/query.js";

const router = Router();

const SOCIAVAULT_API_KEY = process.env.SOCIAVAULT_API_KEY;
const SOCIAVAULT_BASE_URL = "https://api.sociavault.com";

router.get("/creators", async (req: Request, res: Response) => {
  const platforms = parsePlatformQuery(req.query.platforms);

  let creators: CreatorInterface[] = [];

  let query = supabase.from("creators").select(`
    id,
    name,
    youtubeChannelId: youtube_channel_id,
    tiktokHandle: tiktok_handle
  `);

  if (platforms.length > 0) {
    const conditions = [];

    if (platforms.includes("youtube")) {
      conditions.push("youtube_channel_id.not.is.null");
    }

    if (platforms.includes("tiktok")) {
      conditions.push("tiktok_handle.not.is.null");
    }

    if (conditions.length > 0) {
      query = query.or(conditions.join(","));
    }
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  creators = data;

  res.json(creators);
});

router.post("/load-creators", async (req: Request, res: Response) => {
  if (!SOCIAVAULT_API_KEY) {
    return res.status(500).json({ error: "SOCIAVAULT_API_KEY not configured" });
  }

  let maxCursor = null;
  let continuationToken = null;

  // get all the creators from the database
  const { data: creators, error } = await supabase.from("creators").select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // loop through all the creators and get the videos
  for (const creator of creators) {
    console.log("FETCHING", creator.name, "-----------------------");

    let videos: {
      video_id: string;
      creator_id: number;
      platform: string;
      title: string;
      views: number;
      published_at: string;
    }[] = [];

    if (creator.tiktok_handle) {
      console.log("HAS TIKTOK");

      maxCursor = null;

      for (let i = 0; i < 10; i++) {
        console.log("FETCHING TIKTOK PAGE", i + 1);

        let url = `${SOCIAVAULT_BASE_URL}/v1/scrape/tiktok/videos?handle=${creator.tiktok_handle}&sort_by=latest&trim=true`;

        if (maxCursor) {
          url += `&max_cursor=${maxCursor}`;
        }

        const response = await fetch(url, {
          headers: {
            "X-API-Key": SOCIAVAULT_API_KEY,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.data.aweme_list) {
          Object.values(data.data.aweme_list).forEach((video: any) => {
            videos.push({
              video_id: video.aweme_id,
              creator_id: creator.id,
              platform: "tiktok",
              title: video.desc,
              views: video.statistics.play_count,
              published_at: video.create_time_utc,
            });
          });
        }

        maxCursor = data.data.max_cursor;
      }
    }

    if (creator.youtube_channel_id) {
      console.log("HAS YOUTUBE");

      continuationToken = null;

      for (let i = 0; i < 10; i++) {
        console.log("FETCHING YOUTUBE PAGE", i + 1);

        let url = `${SOCIAVAULT_BASE_URL}/v1/scrape/youtube/channel-videos?channelId=${creator.youtube_channel_id}&sort=latest`;

        if (continuationToken) {
          url += `&continuationToken=${continuationToken}`;
        }

        const response = await fetch(url, {
          headers: {
            "X-API-Key": SOCIAVAULT_API_KEY,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.data.videos) {
          Object.values(data.data.videos).forEach((video: any) => {
            videos.push({
              video_id: video.id,
              creator_id: creator.id,
              platform: "youtube",
              title: video.title,
              views: video.viewCountInt,
              published_at: video.publishedTime,
            });
          });
        }

        continuationToken = data.data.continuationToken;
      }
    }

    // insert the videos for the creator into the database
    const { data, error } = await supabase.from("videos").upsert(videos, {
      onConflict: "video_id,platform",
      ignoreDuplicates: false, // false so views/title get updated
    });

    if (error) {
      console.log(error);

      throw error;
    }
  }

  res.json({ message: "Videos loaded" });
});

export default router;
