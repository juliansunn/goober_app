"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { PhaseView } from "../PhaseView";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { format } from "date-fns";
import { WorkoutScheduleFormData } from "@/types/workout";
import { useWorkoutForm } from "@/hooks/useWorkoutForm";
import { toast } from "sonner";

export function WorkoutSkeleton({ data }: { data: WorkoutScheduleFormData }) {
  const {
    formData,
    updateWorkoutSchedule,
    updateWorkoutSchedulePending,
    deleteWorkoutSchedule,
  } = useWorkoutForm();

  if (!data) return null;

  const totalPhases = data.schedule?.phases.length ?? 0;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  const handleSave = async () => {
    await updateWorkoutSchedule({ data: formData });
  };

  const handleDelete = async () => {
    await deleteWorkoutSchedule(formData.id?.toString() ?? "");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          Workout Schedule: {formatDate(data.startDate)} to{" "}
          {formatDate(data.raceDate)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{data.schedule?.description}</p>
        <Carousel className="w-full">
          <CarouselContent>
            {data.schedule?.phases.map((phase, index) => (
              <CarouselItem key={index}>
                <PhaseView
                  scheduleId={data.id}
                  phase={phase}
                  phaseIndex={index}
                  totalPhases={totalPhases}
                  previousPhase={
                    index > 0 ? data.schedule?.phases[index - 1] : undefined
                  }
                  nextPhase={
                    index < totalPhases - 1
                      ? data.schedule?.phases[index + 1]
                      : undefined
                  }
                  onUpdate={handleSave}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="mt-4 space-x-2">
          <Button
            variant="secondary"
            onClick={handleSave}
            disabled={updateWorkoutSchedulePending}
          >
            {updateWorkoutSchedulePending ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={updateWorkoutSchedulePending}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
