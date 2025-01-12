"use client";

import { ErrorDisplay } from "@/components/error-display";
import { LoadingCenter } from "@/components/loading-center";
import { useState, useEffect } from "react";
import { useWorkout } from "@/app/contexts/WorkoutContext";
import { WorkoutWeeklyCalendar } from "@/components/weeklySchedule/weekly-calendar";

export function WeeklyCalendarComponent() {
  const currentDate = new Date();
  const [startDate, setStartDate] = useState(() => {
    // Start with today
    return new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
  });

  const [endDate, setEndDate] = useState(() => {
    // Calculate end of current week (Sunday)
    const end = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const daysUntilEndOfWeek = 7 - end.getDay(); // Assuming Sunday is 0, Sunday is 7
    end.setDate(end.getDate() + daysUntilEndOfWeek);
    return end;
  });

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
      <WorkoutWeeklyCalendar />
      {isFetchingStrava && <LoadingCenter />}
    </>
  );
}
