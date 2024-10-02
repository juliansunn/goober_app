"use client";

import { ErrorDisplay } from "@/components/error-display";
import { LoadingCenter } from "@/components/loading-center";
import { WorkoutCalendarComponent } from "@/components/workout-calendar";
import { getScheduledWorkoutsList } from "@/functions/scheduled-workouts";
import { getStravaActivities } from "@/functions/strava";
import { StravaActivity } from "@/types/strava";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarItem } from "@/types/calendar";
import { ScheduledWorkout } from "@/types/workouts";

export function CalendarComponent() {
  const currentDate = new Date();
  const [startDate, setStartDate] = useState(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  );
  const [endDate, setEndDate] = useState(
    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  );
  const [page, setPage] = useState(1);
  const perPage = 30; // You can make this adjustable if needed

  const {
    data: scheduledWorkouts,
    isLoading: isLoadingWorkouts,
    error: workoutsError,
  } = useQuery({
    queryKey: ["scheduled-workouts", { startDate, endDate }],
    queryFn: () => getScheduledWorkoutsList({ startDate, endDate }),
    staleTime: Infinity,
  });
  console.log("scheduledWorkouts", scheduledWorkouts);
  const {
    data: stravaActivities,
    isLoading: isLoadingStrava,
    error: stravaError,
    isFetching: isFetchingStrava,
  } = useQuery<StravaActivity[]>({
    queryKey: ["strava-activities", { startDate, endDate, page, perPage }],
    queryFn: () =>
      getStravaActivities({
        after: Math.floor(startDate.getTime() / 1000),
        before: Math.floor(endDate.getTime() / 1000),
        page,
        per_page: perPage,
      }),
    staleTime: Infinity,
  });

  const calendarItems: CalendarItem[] = [
    ...(scheduledWorkouts?.map((workout: ScheduledWorkout) => ({
      itemType: "scheduledWorkout" as const,
      item: workout,
    })) || []),
    ...(stravaActivities?.map((activity: StravaActivity) => ({
      itemType: "stravaActivity" as const,
      item: activity,
    })) || []),
  ];

  const isLoading = isLoadingWorkouts || isLoadingStrava;
  const error = workoutsError || stravaError;

  if (isLoading) {
    return <LoadingCenter />;
  }

  if (error) {
    return <ErrorDisplay title="Error" message={error.message} />;
  }

  if (!scheduledWorkouts && !stravaActivities) {
    return (
      <ErrorDisplay title="No Data" message="No workouts or activities found" />
    );
  }

  return (
    <>
      <WorkoutCalendarComponent
        calendarItems={calendarItems}
        startDate={startDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      {isFetchingStrava || (isLoadingWorkouts && <LoadingCenter />)}
      {/* Add pagination controls here if needed */}
    </>
  );
}
