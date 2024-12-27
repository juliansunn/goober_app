"use client";

import { useEffect, useState } from "react";
import { WorkoutSkeleton } from "@/components/workoutSkeletonForm/WorkoutSkeleton";
import { useWorkout } from "@/app/contexts/WorkoutContext";
import { AiLoading } from "@/components/ui/AiLoading";
import { WorkoutSkeletonFormData } from "@/types/skeleton";

export default function ScheduleDetailsPage({
  params,
}: {
  params: { skeletonId: string };
}) {
  const { loadSkeleton, isLoadingSkeleton, userSkeleton } = useWorkout();

  console.log(userSkeleton);

  useEffect(() => {
    loadSkeleton(params.skeletonId);
  }, [loadSkeleton, params.skeletonId]);

  if (isLoadingSkeleton) {
    return <AiLoading loadingText="Loading workout schedule..." />;
  }

  if (!userSkeleton) {
    return <div>No workout schedule found.</div>;
  }

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Schedule Details
          </h2>
          <p className="text-muted-foreground">
            View and manage your training schedule
          </p>
        </div>
      </div>
      <WorkoutSkeleton userSkeleton={userSkeleton} />
    </div>
  );
}
