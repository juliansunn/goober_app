"use client";

import { ErrorDisplay } from "@/components/error-display";
import { LoadingCenter } from "@/components/loading-center";
import { WorkoutCalendarComponent } from "@/components/workout-calendar";
import { getScheduledWorkoutsList } from "@/functions/scheduled-workouts";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export function CalendarComponent() {
  const currentDate = new Date();
  const [startDate, setStartDate] = useState(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  );
  const [endDate, setEndDate] = useState(
    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["scheduled-workouts", { startDate, endDate }],
    queryFn: () => getScheduledWorkoutsList({ startDate, endDate }),
    staleTime: Infinity, // Keep the data fresh indefinitely
  });
  console.log("startDate", startDate);
  console.log("endDate", endDate);

  useEffect(() => {
    // Refetch data when date range changes
    refetch();
    console.log("startDate: in refetch", startDate);
    console.log("endDate: in refetch", endDate);
  }, [startDate, endDate, refetch]);

  if (isLoading) {
    return <LoadingCenter />;
  }

  if (error) {
    return <ErrorDisplay title="Error" message={error.message} />;
  }

  if (!data) {
    return <ErrorDisplay title="No Data" message="No workouts found" />;
  }

  return (
    <WorkoutCalendarComponent
      initialWorkouts={data}
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
    />
  );
}
