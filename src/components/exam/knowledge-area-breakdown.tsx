"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  TrendingUp,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { KnowledgeAreaScore } from "@/lib/exam-scoring";
import { getPerformanceLevelColor } from "@/lib/exam-scoring";

interface KnowledgeAreaBreakdownProps {
  knowledgeAreaScores: KnowledgeAreaScore[];
  className?: string;
}

export function KnowledgeAreaBreakdown({
  knowledgeAreaScores,
  className = "",
}: KnowledgeAreaBreakdownProps) {
  // Sort by weight percentage (descending) for display
  const sortedAreas = [...knowledgeAreaScores].sort(
    (a, b) => b.weight_percentage - a.weight_percentage
  );

  const getPerformanceIcon = (
    level: KnowledgeAreaScore["performance_level"]
  ) => {
    switch (level) {
      case "excellent":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "good":
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case "needs_improvement":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "poor":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Target className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRecommendation = (area: KnowledgeAreaScore): string => {
    const { performance_level, score_percentage } = area;

    if (performance_level === "excellent") {
      return "Outstanding! You've mastered this area.";
    } else if (performance_level === "good") {
      return "Great job! Minor review recommended.";
    } else if (performance_level === "needs_improvement") {
      return "Focus more study time on this area.";
    } else {
      return "Significant improvement needed. Consider additional resources.";
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Knowledge Area Performance
        </CardTitle>
        <p className="text-sm text-gray-600">
          Detailed breakdown of your performance by certification topic
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {sortedAreas.length}
            </div>
            <div className="text-sm text-gray-600">Total Areas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {
                sortedAreas.filter(
                  area =>
                    area.performance_level === "excellent" ||
                    area.performance_level === "good"
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Strong Areas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {
                sortedAreas.filter(
                  area => area.performance_level === "needs_improvement"
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Need Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {
                sortedAreas.filter(area => area.performance_level === "poor")
                  .length
              }
            </div>
            <div className="text-sm text-gray-600">Weak Areas</div>
          </div>
        </div>

        {/* Individual Knowledge Areas */}
        <div className="space-y-4">
          {sortedAreas.map(area => (
            <div key={area.id} className="border rounded-lg p-4 space-y-3">
              {/* Area Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getPerformanceIcon(area.performance_level)}
                    <h3 className="font-semibold text-gray-900">{area.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {area.weight_percentage}% of exam
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {getRecommendation(area)}
                  </p>
                </div>

                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {area.score_percentage}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {area.correct_answers}/{area.total_questions} correct
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress value={area.score_percentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Performance Badge */}
              <div className="flex items-center justify-between">
                <Badge
                  className={`${getPerformanceLevelColor(area.performance_level)} text-xs px-2 py-1 capitalize`}
                >
                  {area.performance_level.replace("_", " ")}
                </Badge>

                {/* Weight Indicator */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3" />
                  <span>Weight: {area.weight_percentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Study Recommendations */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Study Recommendations
          </h4>

          <div className="space-y-2">
            {/* Areas needing improvement */}
            {sortedAreas
              .filter(
                area =>
                  area.performance_level === "poor" ||
                  area.performance_level === "needs_improvement"
              )
              .sort((a, b) => b.weight_percentage - a.weight_percentage)
              .slice(0, 3)
              .map(area => (
                <div
                  key={`rec-${area.id}`}
                  className="flex items-center gap-3 p-2 bg-yellow-50 rounded border border-yellow-200"
                >
                  <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">
                      {area.name}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      ({area.score_percentage}% - {area.weight_percentage}% of
                      exam)
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Priority
                  </Badge>
                </div>
              ))}

            {/* If no weak areas, show encouragement */}
            {sortedAreas.every(
              area =>
                area.performance_level === "excellent" ||
                area.performance_level === "good"
            ) && (
              <div className="flex items-center gap-3 p-2 bg-green-50 rounded border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Excellent performance across all knowledge areas! Consider
                  taking the real certification exam.
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
