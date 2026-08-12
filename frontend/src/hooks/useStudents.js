"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

export function useStudents({ search = "", risk_level = "", cursor = null, limit = 20 } = {}) {
  return useQuery({
    queryKey: ["students", { search, risk_level, cursor, limit }],
    queryFn: async () => {
      const response = await apiClient.get("/students", {
        params: { search, risk_level, cursor, limit },
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
