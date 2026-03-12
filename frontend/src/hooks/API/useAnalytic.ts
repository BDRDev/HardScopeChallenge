import { useQuery, type UseQueryResult } from "@tanstack/react-query";

//Services
import apiService from "../../services/apiService";

//Interfaces
import type AnalyticsInterface from "../../interfaces/Analytics/AnalyticsInterface";

export interface AnalyticsParams {
  startDate: string | null;
  endDate: string | null;
  creatorIds?: number[] | null;
  platforms?: string[] | null;
}

export const useGetAnalytics = (
  params?: AnalyticsParams,
): UseQueryResult<AnalyticsInterface, Error> => {
  const startDate = params?.startDate ?? null;
  const endDate = params?.endDate ?? null;
  const creatorIds = params?.creatorIds ?? null;
  const platforms = params?.platforms ?? null;

  return useQuery({
    queryKey: [
      "analytics",
      startDate,
      endDate,
      creatorIds?.join(",") ?? "",
      platforms?.join(",") ?? "",
    ],
    queryFn: async () => {
      const requestParams: Record<string, string> = {};
      if (startDate) requestParams.startDate = startDate;
      if (endDate) requestParams.endDate = endDate;
      if (creatorIds != null && creatorIds.length > 0)
        requestParams.creatorIds = creatorIds.join(",");
      if (platforms != null && platforms.length > 0)
        requestParams.platforms = platforms.join(",");

      const response = await apiService.get("/analytics", {
        params: requestParams,
      });

      return response.data;
    },
  });
};
