"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Week, WorkoutSkeletonFormData } from "../types/skeleton";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { Edit2, Save } from "lucide-react";
import { WeekFormSection } from "./workoutSkeletonForm/WeekFormSection";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { WorkoutType } from "../types/workouts";

interface WeekViewProps {
  week: Week;
  weekIndex: number;
  phaseIndex: number;
  onUpdate?: (updatedWeek: Week) => void;
}

export function WeekView({
  week,
  weekIndex,
  phaseIndex,
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
          objective: "",
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
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Week {week.weekNumber}</span>
          {onUpdate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
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
        <Link href={`/generate-workouts/${week.weekNumber}`} passHref>
          <Button className="w-full" size="sm">
            View Weekly Schedule
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
