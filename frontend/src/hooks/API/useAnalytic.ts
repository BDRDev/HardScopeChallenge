import { useQuery, type UseQueryResult } from "@tanstack/react-query";

//Services
import apiService from "../../services/apiService";

export const useGetAnalytics = (platforms: string[]): UseQueryResult<any> => {
  return useQuery({
    queryKey: ["analytics", platforms],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      queryParams.append("platforms", platforms.join(","));

      const response = await apiService.get("/analytics", {
        params: queryParams,
      });

      return response.data;
    },
  });
};
