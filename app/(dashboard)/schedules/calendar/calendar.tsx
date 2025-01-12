"use client";

import { ErrorDisplay } from "@/components/error-display";
import { LoadingCenter } from "@/components/loading-center";
import { WorkoutCalendarComponent } from "@/components/workout-calendar";
import { useState, useEffect } from "react";
import { useWorkout } from "@/app/contexts/WorkoutContext";

export function CalendarComponent() {
  const currentDate = new Date();
  const [startDate, setStartDate] = useState(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  );
  const [endDate, setEndDate] = useState(
    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  );

  const {
    setDateRange,
    stravaActivities,
    isLoadingStrava,
    isFetchingStrava,
    stravaError,
  } = useWorkout();

  useEffect(() => {
    setDateRange(startDate, endDate);
  }, [startDate, endDate, setDateRange]);

  const isLoading = isLoadingStrava;
  const error = stravaError;

  if (isLoading) {
    return <LoadingCenter />;
  }

  if (error) {
    return <ErrorDisplay title="Error" message={error.message} />;
  }

  if (!stravaActivities) {
    return (
      <ErrorDisplay title="No Data" message="No workouts or activities found" />
    );
  }

  return (
    <>
      <WorkoutCalendarComponent
        startDate={startDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      {isFetchingStrava && <LoadingCenter />}
    </>
  );
}
