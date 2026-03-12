import { Router, Request, Response } from "express";

//Utils
import supabase from "../utils/supabase.js";
import { parsePlatformQuery } from "../utils/query.js";

const router = Router();

function parseDateParam(value: unknown): string | null {
  if (value == null || typeof value !== "string" || value.trim() === "")
    return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : value.trim();
}

function toStartOfDayUTC(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}T00:00:00.000Z`;
}

function toEndOfDayUTC(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}T23:59:59.999Z`;
}

function parseCreatorIds(value: unknown): number[] | null {
  if (value == null || typeof value !== "string" || value.trim() === "")
    return null;
  const ids = value
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
  return ids.length > 0 ? ids : null;
}

router.get("/analytics", async (req: Request, res: Response) => {
  const rawStart = parseDateParam(req.query.startDate);
  const rawEnd = parseDateParam(req.query.endDate);
  const p_start_date = rawStart ? toStartOfDayUTC(rawStart) : null;
  const p_end_date = rawEnd ? toEndOfDayUTC(rawEnd) : null;
  const p_creator_ids = parseCreatorIds(req.query.creatorIds);
  const p_platforms = parsePlatformQuery(req.query.platforms);

  const rpcParams = { p_start_date, p_end_date, p_creator_ids, p_platforms };

  const [summaryRes, platformRes, creatorRes, topVideosRes] = await Promise.all(
    [
      supabase.rpc("get_video_analytics_summary", rpcParams),
      supabase.rpc("get_video_analytics_by_platform", rpcParams),
      supabase.rpc("get_analytics_by_creator", rpcParams),
      supabase.rpc("get_top_videos", rpcParams),
    ],
  );

  const summary = summaryRes.data?.[0];
  const byPlatform = platformRes.data ?? [];
  const byCreator = creatorRes.data ?? [];
  const topVideos = topVideosRes.data ?? [];

  if (summaryRes.error) {
    console.error("get_video_analytics:", summaryRes.error);

    return res.status(500).json({
      error: "Failed to load analytics summary",
      message: summaryRes.error.message,
    });
  }

  if (platformRes.error) {
    console.error("get_video_analytics_by_platform:", platformRes.error);

    return res.status(500).json({
      error: "Failed to load analytics by platform",
      message: platformRes.error.message,
    });
  }

  if (creatorRes.error) {
    console.error("get_analytics_by_creator:", creatorRes.error);

    return res.status(500).json({
      error: "Failed to load analytics by creator",
      message: creatorRes.error.message,
    });
  }

  if (topVideosRes.error) {
    console.error("get_top_videos:", topVideosRes.error);

    return res.status(500).json({
      error: "Failed to load top videos",
      message: topVideosRes.error.message,
    });
  }

  res.json({
    summary: summary,
    byPlatform: byPlatform,
    byCreator: byCreator,
    topVideos: topVideos,
  });
});

export default router;
