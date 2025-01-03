"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { WeekView } from "./WeekView";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { format, addDays } from "date-fns";
import { Phase } from "@/types/skeleton";
import { Input } from "./ui/input";
import { DatePicker } from "./ui/date-picker";
import { Form } from "./ui/form";
import { useForm } from "react-hook-form";

interface PhaseViewProps {
  scheduleId?: string;
  phase: Phase;
  phaseIndex: number;
  totalPhases: number;
  previousPhase?: Phase;
  nextPhase?: Phase;
  onUpdate?: (updatedPhase: Phase) => void;
  onRemove?: () => void;
}

export function PhaseView({
  scheduleId,
  phase,
  phaseIndex,
  totalPhases,
  previousPhase,
  nextPhase,
  onUpdate,
  onRemove,
}: PhaseViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const form = useForm({
    defaultValues: {
      name: phase.name,
      startDate: phase.startDate,
      endDate: phase.endDate,
      objective: phase.objective,
    },
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  const handleFieldChange = (field: string, value: any) => {
    if (onUpdate) {
      const updatedPhase = {
        ...phase,
        [field]: value,
      };
      onUpdate(updatedPhase);
    }
  };

  // Get the valid date ranges considering adjacent phases
  const getStartDateConstraints = () => {
    const minDate = previousPhase
      ? addDays(new Date(previousPhase.endDate), 1)
      : undefined;
    const maxDate = new Date(phase.endDate);
    return { fromDate: minDate, toDate: maxDate };
  };

  const getEndDateConstraints = () => {
    const minDate = addDays(new Date(phase.startDate), 1);
    const maxDate = nextPhase
      ? addDays(new Date(nextPhase.startDate), -1)
      : undefined;
    return { fromDate: minDate, toDate: maxDate };
  };

  const startDateConstraints = getStartDateConstraints();
  const endDateConstraints = getEndDateConstraints();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Input
              value={phase.name}
              className="max-w-[200px]"
              onChange={(e) => handleFieldChange("name", e.target.value)}
            />
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Phase {phaseIndex + 1} of {totalPhases}
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
        <Form {...form}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <DatePicker
                date={new Date(phase.startDate)}
                onDateChange={(date) => {
                  const newDate = date?.toISOString() ?? "";
                  handleFieldChange("startDate", newDate);
                }}
                fromDate={startDateConstraints.fromDate}
                toDate={startDateConstraints.toDate}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <DatePicker
                date={new Date(phase.endDate)}
                onDateChange={(date) => {
                  const newDate = date?.toISOString() ?? "";
                  handleFieldChange("endDate", newDate);
                }}
                fromDate={endDateConstraints.fromDate}
                toDate={endDateConstraints.toDate}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">Objective:</span>
            <Input
              value={phase.objective}
              className="max-w-[300px]"
              onChange={(e) => handleFieldChange("objective", e.target.value)}
            />
          </div>
        </Form>
        {isExpanded && (
          <div className="space-y-4 mt-4">
            {phase.weeks.map((week, weekIndex) => (
              <WeekView
                scheduleId={scheduleId}
                key={week.weekNumber}
                week={week}
                weekIndex={weekIndex}
                phaseIndex={phaseIndex}
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
