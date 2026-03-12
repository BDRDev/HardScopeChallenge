import {
  useQuery,
  useMutation,
  type UseQueryResult,
} from "@tanstack/react-query";

//Services
import apiService from "../../services/apiService";

interface Creator {
  id: number;
  name: string;
  platform: string;
  followers: number;
  engagement: number;
}

export const useGetCreators = ({
  platforms,
}: {
  platforms: string[];
}): UseQueryResult<Creator[]> => {
  return useQuery({
    queryKey: ["creators", platforms],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};

      if (platforms.length > 0) {
        queryParams.platforms = platforms.join(",");
      }

      const response = await apiService.get("/creators", {
        params: queryParams,
      });

      return response.data;
    },
  });
};

export const useLoadCreators = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiService.post("/load-creators");
      return response.data;
    },
  });
};
