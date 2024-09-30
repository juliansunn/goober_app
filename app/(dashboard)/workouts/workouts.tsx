"use client";

import React, { useState } from "react";
import { WorkoutTable } from "@/components/workout-table";
import { Workout } from "@/types/workouts";
import { getWorkoutsList } from "@/functions/workouts";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ErrorDisplay } from "@/components/error-display";
import { LoadingCenter } from "@/components/loading-center";

interface WorkoutsResponse {
  workouts: Workout[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface WorkoutsProps {
  onSelectWorkout?: (workoutId: number) => void;
}

export default function Workouts({ onSelectWorkout }: WorkoutsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [limit, setLimit] = useState(
    parseInt(searchParams.get("limit") || "100")
  );
  const type = searchParams.get("type") as "authored" | "favorited" | null;

  const { data, isLoading, error } = useQuery<WorkoutsResponse>({
    queryKey: ["workouts", page, limit, type],
    queryFn: () => getWorkoutsList({ page, limit, type }),
    staleTime: 60 * 1000, // Data is fresh for 1 minute
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(
      `/workouts?page=${newPage}&limit=${limit}${type ? `&type=${type}` : ""}`
    );
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
    router.push(
      `/workouts?page=1&limit=${newLimit}${type ? `&type=${type}` : ""}`
    );
  };

  const handleWorkoutSelect = (workoutId: number) => {
    if (onSelectWorkout) {
      onSelectWorkout(workoutId);
    }
  };

  if (isLoading) {
    return <LoadingCenter />;
  }

  if (error) {
    return <ErrorDisplay title="Error" message={(error as Error).message} />;
  }

  if (!data) {
    return <ErrorDisplay title="No Data" message="No workouts found" />;
  }

  return (
    <WorkoutTable
      workouts={data.workouts}
      currentPage={data.page}
      totalPages={Math.ceil(data.total / data.limit)}
      limit={data.limit}
      onPageChange={handlePageChange}
      onLimitChange={handleLimitChange}
    />
  );
}
