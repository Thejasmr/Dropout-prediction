"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

export function useRiskScore(studentId) {
  return useQuery({
    queryKey: ["riskScore", studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const response = await apiClient.get(`/students/${studentId}/risk`);
      return response.data;
    },
    enabled: Boolean(studentId),
  });
}
