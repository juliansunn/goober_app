"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { WorkoutBuilder } from "@/components/workout-builder";
import { getWorkoutById } from "@/functions/workouts";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ErrorDisplay } from "@/components/error-display";

export default function WorkoutPage() {
  const { workoutId } = useParams();

  const {
    data: workout,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workout", workoutId],
    queryFn: () => getWorkoutById(workoutId as string),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay title="Error" message={(error as Error).message} />;
  }
  if (!workout) {
    return <ErrorDisplay title="Not Found" message="Workout not found" />;
  }

  return <WorkoutBuilder initialWorkout={workout} />;
}
