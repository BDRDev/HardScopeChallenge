import { useQuery, type UseQueryResult } from "@tanstack/react-query";

//Services
import apiService from "../../services/apiService";

interface Creator {
  id: string;
  name: string;
  platform: string;
  followers: number;
  engagement: number;
}

export const useGetCreators = (): UseQueryResult<Creator[]> => {
  return useQuery({
    queryKey: ["creators"],
    queryFn: async () => {
      const response = await apiService.get("/creators");

      return response.data;
    },
  });
};
