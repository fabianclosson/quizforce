"use client";

import { useState, useEffect } from "react";
import { KnowledgeAreaForm } from "./knowledge-area-form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface KnowledgeAreaEditFormProps {
  knowledgeAreaId: string;
}

interface KnowledgeAreaData {
  id: string;
  name: string;
  description: string | null;
  certification_id: string;
  weight_percentage: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function KnowledgeAreaEditForm({
  knowledgeAreaId,
}: KnowledgeAreaEditFormProps) {
  const [knowledgeArea, setKnowledgeArea] = useState<KnowledgeAreaData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKnowledgeArea = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/admin/knowledge-areas/${knowledgeAreaId}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Knowledge area not found");
          }
          throw new Error("Failed to fetch knowledge area");
        }

        const data = await response.json();
        setKnowledgeArea(data.knowledgeArea);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Error fetching knowledge area:", err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledgeArea();
  }, [knowledgeAreaId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error || !knowledgeArea) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error || "Knowledge area not found"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <KnowledgeAreaForm
      mode="edit"
      knowledgeArea={{
        id: knowledgeArea.id,
        name: knowledgeArea.name,
        description: knowledgeArea.description || "",
        certification_id: knowledgeArea.certification_id,
        weight_percentage: knowledgeArea.weight_percentage,
        sort_order: knowledgeArea.sort_order,
      }}
    />
  );
}
