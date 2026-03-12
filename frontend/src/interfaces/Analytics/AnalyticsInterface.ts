export default interface AnalyticsInterface {
  summary: {
    totalViews: number;
    totalVideos: number;
    creatorCount: number;
    avgViewsPerVideo: number;
  };
  byPlatform: {
    platform: string;
    views: number;
    videoCount: number;
  }[];
  byCreator: {
    creatorId: number;
    creatorName: string;
    totalViews: number;
    videoCount: number;
    avgViewsPerVideo: number;
    byPlatform: {
      platform: string;
      avgViewsPerVideo: number;
    }[];
  }[];
  topVideos: {
    videoId: string;
    creatorId?: number;
    title: string;
    creatorName: string;
    platform: string;
    views: number;
    publishedAt: string;
  }[];
}
