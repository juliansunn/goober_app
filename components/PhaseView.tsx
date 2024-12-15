"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { WeekView } from "./WeekView";
import { ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { Phase } from "@/types/skeleton";

interface PhaseViewProps {
  phase: Phase;
  phaseNumber: number;
  totalPhases: number;
}

export function PhaseView({ phase, phaseNumber, totalPhases }: PhaseViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{phase.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Phase {phaseNumber} of {totalPhases}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
        </p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">Objective:</span>
          <Badge variant="secondary">{phase.objective}</Badge>
        </div>
        {isExpanded && (
          <div className="space-y-4 mt-4">
            {phase.weeks.map((week) => (
              <WeekView key={week.weekNumber} week={week} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
