"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  PhaseObjective,
  Week,
  WorkoutSkeletonFormData,
} from "../types/skeleton";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { Edit2, Save, ChevronUp, ChevronDown } from "lucide-react";
import { WeekFormSection } from "./workoutSkeletonForm/WeekFormSection";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { WorkoutType } from "../types/workouts";
import { WorkoutWeeklyCalendar } from "./weeklySchedule/weekly-calendar";

interface WeekViewProps {
  week: Week;
  weekIndex: number;
  phaseIndex: number;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveWeek?: (direction: "up" | "down") => void;
  onUpdate?: (updatedWeek: Week) => void;
}

export function WeekView({
  week,
  weekIndex,
  phaseIndex,
  canMoveUp,
  canMoveDown,
  onMoveWeek,
  onUpdate,
}: WeekViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<WorkoutSkeletonFormData>({
    defaultValues: {
      title: "",
      type: WorkoutType.RUN,
      phases: [
        {
          startDate: "",
          endDate: "",
          weeks: [week],
          name: "",
          objective: PhaseObjective.BASE,
        },
      ],
    },
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  const handleSave = (data: any) => {
    if (onUpdate) {
      onUpdate(data.schedule.phases[0].weeks[0]);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form onSubmit={form.handleSubmit(handleSave)}>
        <WeekFormSection
          weekIndex={0}
          phaseIndex={0}
          control={form.control}
          onRemove={() => setIsEditing(false)}
        />
        <div className="flex justify-end mt-4">
          <Button type="submit" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Week {week.weekNumber}</span>
            {onUpdate && (
              <Button
                variant="ghost"
                type="button"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {canMoveUp && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMoveWeek?.("up")}
                className="text-muted-foreground flex items-center gap-2"
              >
                Move to Phase {phaseIndex}
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
            {canMoveDown && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMoveWeek?.("down")}
                className="text-muted-foreground flex items-center gap-2"
              >
                Move to Phase {phaseIndex + 2}
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-1">
          {formatDate(week.startDate)} - {formatDate(week.endDate)}
        </p>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm">Focus:</span>
          <Badge variant="secondary">{week.focus}</Badge>
        </div>
        <p className="text-sm mb-1">{week.description}</p>
        <p className="text-sm mb-2">
          <strong>Planned Volume:</strong> {week.volumeValue} {week.volumeType}
        </p>
        <WorkoutWeeklyCalendar week={week} />
      </CardContent>
    </Card>
  );
}
