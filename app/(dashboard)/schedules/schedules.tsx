"use client";

import React, { useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useQuery } from "@tanstack/react-query";
import { getAll } from "@/functions/workout-schedules";
import { ErrorDisplay } from "@/components/error-display";
import { LoadingCenter } from "@/components/loading-center";
import { WorkoutScheduleFormData } from "@/types/workout"; // Make sure this type exists

export default function Schedules() {
  const {
    data: schedules,
    isLoading,
    error,
  } = useQuery<WorkoutScheduleFormData[]>({
    queryKey: ["schedules", { page: 1, limit: 100 }],
    queryFn: () => getAll(),
    staleTime: 60 * 1000, // Data is fresh for 1 minute
  });

  if (isLoading) {
    return <LoadingCenter />;
  }

  if (error) {
    return <ErrorDisplay title="Error" message={(error as Error).message} />;
  }

  if (!schedules) {
    return <ErrorDisplay title="No Data" message="No schedules found" />;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">My Training Schedules</h1>
      <DataTable columns={columns} data={schedules} />
    </div>
  );
}
