"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

export function useIngestion() {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, fieldMapping, entityType }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (entityType) {
        formData.append("entity_type", entityType);
      }
      if (fieldMapping) {
        formData.append("field_mapping_json", JSON.stringify(fieldMapping));
      }
      const response = await apiClient.post("/ingestion/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingestionHistory"] });
    },
  });

  const historyQuery = useQuery({
    queryKey: ["ingestionHistory"],
    queryFn: async () => {
      const response = await apiClient.get("/ingestion/history");
      return response.data;
    },
  });

  return { uploadFile: uploadMutation.mutateAsync, history: historyQuery.data || [] };
}
