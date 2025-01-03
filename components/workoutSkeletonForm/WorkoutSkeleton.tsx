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
import { useWorkout } from "@/app/contexts/WorkoutContext";
import { WorkoutSkeletonFormData } from "@/types/skeleton";

export function WorkoutSkeleton({
  userSkeleton,
}: {
  userSkeleton: WorkoutSkeletonFormData;
}) {
  const { isSavingSkeleton, updateSkeleton, deleteSkeleton } = useWorkout();

  if (!userSkeleton) return null;

  const totalPhases = userSkeleton.phases.length;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  const handleSave = async () => {
    await updateSkeleton(userSkeleton);
  };

  const handleDelete = async () => {
    if (await deleteSkeleton()) {
      // Handle successful deletion, e.g., redirect
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          Workout Schedule: {formatDate(userSkeleton.startDate)} to{" "}
          {formatDate(userSkeleton.endDate)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{userSkeleton.description}</p>
        <Carousel className="w-full">
          <CarouselContent>
            {userSkeleton.phases.map((phase, index) => (
              <CarouselItem key={index}>
                <PhaseView
                  scheduleId={userSkeleton.id}
                  phase={phase}
                  phaseIndex={index}
                  totalPhases={totalPhases}
                  previousPhase={
                    index > 0 ? userSkeleton.phases[index - 1] : undefined
                  }
                  nextPhase={
                    index < totalPhases - 1
                      ? userSkeleton.phases[index + 1]
                      : undefined
                  }
                  onUpdate={(updatedPhase) => {
                    const updatedPhases = [...userSkeleton.phases];
                    updatedPhases[index] = updatedPhase;
                    updateSkeleton({
                      ...userSkeleton,
                      phases: updatedPhases,
                    });
                  }}
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
            disabled={isSavingSkeleton}
          >
            {isSavingSkeleton ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isSavingSkeleton}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
