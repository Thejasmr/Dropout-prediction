"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

export function useAlerts({ severity = "", is_read = null } = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["alerts", { severity, is_read }],
    queryFn: async () => {
      const response = await apiClient.get("/alerts", {
        params: { severity: severity || undefined, is_read: is_read ?? undefined },
      });
      return response.data;
    },
    staleTime: 30 * 1000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (alertId) => {
      const response = await apiClient.patch(`/alerts/${alertId}/read`, { is_read: true });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  return { ...query, markRead: markReadMutation.mutateAsync };
}
