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
import { toast } from "sonner";
import { workoutSkeletonService } from "@/services/workout-skeleton-service";
import type { WorkoutSkeleton } from "@/types";
import { WorkoutType } from "@/types/workouts";

interface WorkoutSkeletonProps {
  title: string;
  type: WorkoutType;
  skeletonData?: WorkoutSkeleton;
}

export function WorkoutSkeleton({
  title,
  type,
  skeletonData,
}: WorkoutSkeletonProps) {
  const [isSaving, setIsSaving] = useState(false);

  if (!skeletonData) return null;

  const totalPhases = skeletonData?.schedule.phases.length;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await workoutSkeletonService.create({
        title,
        type,
        schedule: skeletonData.schedule,
      });
      toast.success("Workout schedule saved successfully!");
    } catch (error) {
      console.error("Error saving workout schedule:", error);
      toast.error("Failed to save workout schedule");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          Workout Schedule: {formatDate(skeletonData?.schedule.startDate)} to{" "}
          {formatDate(skeletonData?.schedule.endDate)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{skeletonData.schedule.description}</p>
        <Carousel className="w-full">
          <CarouselContent>
            {skeletonData?.schedule.phases.map((phase, index) => (
              <CarouselItem key={index}>
                <PhaseView
                  phase={phase}
                  phaseNumber={index + 1}
                  totalPhases={totalPhases}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="mt-4 space-x-2">
          <Button variant="secondary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
