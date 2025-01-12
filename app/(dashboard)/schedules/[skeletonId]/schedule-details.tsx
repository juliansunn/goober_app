"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ErrorDisplay } from "../../../../components/error-display";
import { LoadingCenter } from "../../../../components/loading-center";
import { getById } from "../../../../functions/workout-schedules";
import { WorkoutScheduleForm } from "../../../../components/workoutSkeletonForm/WorkoutScheduleForm";
import { ZodNumberCheck } from "zod";

export default function WorkoutScheduleDetails({
  skeletonId,
}: {
  skeletonId: number;
}) {
  const {
    data: workout,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workout-schedule", Number(skeletonId)],
    queryFn: () => getById(Number(skeletonId)),
    staleTime: 60 * 1000, // Data is fresh for 1 minute
  });

  if (isLoading) {
    return <LoadingCenter />;
  }

  if (error) {
    return <ErrorDisplay title="Error" message={(error as Error).message} />;
  }
  if (!workout) {
    return <ErrorDisplay title="Not Found" message="Workout not found" />;
  }

  return <WorkoutScheduleForm initialData={workout} />;
}
