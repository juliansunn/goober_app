"use client";

import { Phase, PhaseObjective } from "@/types/skeleton";
import { formatDateString } from "@/utils/date-utils";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { WeekView } from "./WeekView";

interface PhaseViewProps {
  phase: Phase;
  phaseIndex: number;
  totalPhases: number;
  onUpdate?: (updatedPhase: Phase) => void;
  onRemove?: () => void;
  isExpanded: boolean;
  onExpandToggle: () => void;
  onMoveWeek?: (weekIndex: number, direction: "up" | "down") => void;
}

export function PhaseView({
  phase,
  phaseIndex,
  totalPhases,
  onUpdate,
  onRemove,
  isExpanded,
  onExpandToggle,
  onMoveWeek,
}: PhaseViewProps) {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Phase {phaseIndex + 1} of {totalPhases}
          </span>
          <div className="h-4 w-[1px] bg-border" />
          <span className="text-sm text-muted-foreground">
            {phase.weeks.length} {phase.weeks.length === 1 ? "week" : "weeks"}
          </span>
          <div className="h-4 w-[1px] bg-border" />
          <span className="text-sm text-muted-foreground">
            {formatDateString(phase.startDate)} -{" "}
            {formatDateString(phase.endDate)}
          </span>
        </div>

        <CardTitle className="flex flex-wrap justify-between gap-4">
          <div className="flex flex-wrap items-end gap-4 flex-1">
            <div className="min-w-[200px] max-w-[500px] flex-1">
              <label className="text-sm font-medium block mb-2">
                Objective
              </label>
              <Select
                value={phase.objective}
                onValueChange={(value) => {
                  if (onUpdate) {
                    onUpdate({
                      ...phase,
                      objective: value as PhaseObjective,
                    });
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select phase objective" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PhaseObjective).map((objective) => (
                    <SelectItem key={objective} value={objective}>
                      {objective}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 items-end shrink-0">
            {onRemove && (
              <Button
                variant="ghost"
                type="button"
                size="sm"
                onClick={onRemove}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              type="button"
              size="sm"
              onClick={onExpandToggle}
              className="flex items-center gap-2"
            >
              {isExpanded ? (
                <>
                  Hide
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Details
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isExpanded && (
          <div className="space-y-4 mt-4">
            {phase.weeks.map((week, weekIndex) => (
              <WeekView
                key={week.weekNumber}
                week={week}
                phaseIndex={phaseIndex}
                canMoveUp={weekIndex === 0 && phaseIndex > 0}
                canMoveDown={
                  weekIndex === phase.weeks.length - 1 &&
                  phaseIndex < totalPhases - 1
                }
                onMoveWeek={(direction) => {
                  onMoveWeek?.(weekIndex, direction);
                }}
                onUpdate={
                  onUpdate
                    ? (updatedWeek) => {
                        const updatedPhase = {
                          ...phase,
                          weeks: phase.weeks.map((w) =>
                            w.weekNumber === week.weekNumber ? updatedWeek : w
                          ),
                        };
                        onUpdate(updatedPhase);
                      }
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
