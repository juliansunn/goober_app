"use client";

import React, { useState } from "react";
import { WorkoutTable } from "@/components/workout-table";
import { Workout } from "@/types/workouts";
import { getWorkoutsList } from "@/functions/workouts";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ErrorDisplay } from "@/components/error-display";

interface WorkoutsResponse {
  workouts: Workout[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

const Workouts: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [limit, setLimit] = useState(
    parseInt(searchParams.get("limit") || "10")
  );
  const type = searchParams.get("type") as "authored" | "favorited" | null;

  const { data, isLoading, error } = useQuery<WorkoutsResponse>({
    queryKey: ["workouts", page, limit, type],
    queryFn: () => getWorkoutsList({ page, limit, type }),
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
};

export default Workouts;
