"use client";

import { CalendarItem, ScheduledWorkout, StravaActivity } from "@/types";
import React, { createContext, useContext, useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getScheduledWorkoutsList } from "@/functions/scheduled-workouts";
import { getStravaActivities } from "@/functions/strava";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Add this type definition
type GeneratedScheduledWorkout = ScheduledWorkout & { notes: string };

type WorkoutContextType = {
  generatedScheduledWorkouts: GeneratedScheduledWorkout[];
  generateSchedule: (formData: any) => Promise<void>;
  isLoadingScheduledWorkouts: boolean;
  scheduledWorkouts: ScheduledWorkout[] | undefined;
  isLoadingWorkouts: boolean;
  workoutsError: Error | null;
  setDateRange: (startDate: Date, endDate: Date) => void;
  stravaActivities: StravaActivity[] | undefined;
  isLoadingStrava: boolean;
  isFetchingStrava: boolean;
  stravaError: Error | null;
  calendarItems: CalendarItem[];
  bulkCreateScheduledWorkouts: () => Promise<void>;
  clearGeneratedScheduledWorkouts: () => void;
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [generatedScheduledWorkouts, setGeneratedScheduledWorkouts] = useState<
    GeneratedScheduledWorkout[]
  >([]);
  const [isLoadingScheduledWorkouts, setIsLoadingScheduledWorkouts] =
    useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [page, setPage] = useState(1);
  const perPage = 50;

  const {
    data: scheduledWorkouts,
    isLoading: isLoadingWorkouts,
    error: workoutsError,
  } = useQuery<ScheduledWorkout[]>({
    queryKey: [
      "scheduled-workouts",
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () => getScheduledWorkoutsList({ startDate, endDate }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  const {
    data: stravaActivities,
    isLoading: isLoadingStrava,
    error: stravaError,
    isFetching: isFetchingStrava,
  } = useQuery<StravaActivity[]>({
    queryKey: [
      "strava-activities",
      startDate.toISOString(),
      endDate.toISOString(),
      page,
      perPage,
    ],
    queryFn: () =>
      getStravaActivities({
        after: Math.floor(startDate.getTime() / 1000),
        before: Math.floor(endDate.getTime() / 1000),
        page,
        per_page: perPage,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  const calendarItems: CalendarItem[] = [
    ...(scheduledWorkouts?.map((workout) => ({
      itemType: "scheduledWorkout" as const,
      item: workout,
    })) || []),
    ...(stravaActivities?.map((activity) => ({
      itemType: "stravaActivity" as const,
      item: activity,
    })) || []),
    ...(generatedScheduledWorkouts?.map((workout) => ({
      itemType: "generatedScheduledWorkout" as const,
      item: workout,
    })) || []),
  ];

  const queryClient = useQueryClient();

  const generateSchedule = useCallback(async (formData: any) => {
    setIsLoadingScheduledWorkouts(true);
    try {
      const response = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: JSON.stringify(formData),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate workout schedule");
      }

      const data = await response.json();
      setGeneratedScheduledWorkouts(data?.scheduledWorkouts || []);
    } catch (error) {
      console.error("Error generating workout schedule:", error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsLoadingScheduledWorkouts(false);
    }
  }, []);

  const setDateRange = useCallback(
    (start: Date, end: Date) => {
      setStartDate(start);
      setEndDate(end);
      // Invalidate queries when date range changes
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["strava-activities"] });
    },
    [queryClient]
  );

  const bulkCreateScheduledWorkoutsMutation = useMutation({
    mutationFn: async (workouts: ScheduledWorkout[]) => {
      const response = await fetch("/api/scheduled-workouts/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workouts }),
      });

      if (!response.ok) {
        throw new Error("Failed to bulk create scheduled workouts");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
      setGeneratedScheduledWorkouts([]);
      toast.success("Workout schedule created successfully");
    },
    onError: (error) => {
      console.error("Error creating workout schedule:", error);
      toast.error("Failed to create workout schedule");
    },
  });

  const bulkCreateScheduledWorkouts = async () => {
    await bulkCreateScheduledWorkoutsMutation.mutateAsync(
      generatedScheduledWorkouts
    );
  };

  const clearGeneratedScheduledWorkouts = () => {
    setGeneratedScheduledWorkouts([]);
  };

  return (
    <WorkoutContext.Provider
      value={{
        generatedScheduledWorkouts,
        generateSchedule,
        isLoadingScheduledWorkouts,
        scheduledWorkouts,
        isLoadingWorkouts,
        workoutsError: workoutsError as Error | null,
        setDateRange,
        stravaActivities,
        isLoadingStrava,
        isFetchingStrava,
        stravaError,
        calendarItems,
        bulkCreateScheduledWorkouts,
        clearGeneratedScheduledWorkouts,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}
