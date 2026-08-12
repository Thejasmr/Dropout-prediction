"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

export function useStudent(studentId) {
  return useQuery({
    queryKey: ["student", studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const response = await apiClient.get(`/students/${studentId}`);
      return response.data;
    },
    enabled: Boolean(studentId),
  });
}
