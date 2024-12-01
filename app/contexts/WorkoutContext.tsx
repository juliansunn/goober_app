"use client";

import {
  WorkoutType,
  IntervalType,
  DurationType,
  IntensityType,
} from "@prisma/client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getScheduledWorkoutsList } from "@/functions/scheduled-workouts";
import { getStravaActivities } from "@/functions/strava";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  CreateWorkoutInput,
  UpdateWorkoutInput,
} from "@/schemas/workout-schema";
import { useCreateWorkout } from "@/hooks/useCreateWorkout";
import { useUpdateWorkout } from "@/hooks/useUpdateWorkout";
import {
  CalendarItem,
  Interval,
  RepeatGroup,
  ScheduledWorkout,
  StravaActivity,
  Workout,
  WorkoutItem,
} from "@/types";

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
  createOrUpdateWorkout: (
    workoutData: CreateWorkoutInput | UpdateWorkoutInput,
    isEditing: boolean
  ) => Promise<Workout>;
  isLoadingCreateOrUpdateWorkout: boolean;
  builderWorkout: Workout;
  setBuilderWorkout: (workout: Workout) => void;
  isEditing: boolean;
  editingItem: WorkoutItem | null;
  setEditingItem: (item: WorkoutItem | null) => void;
  newInterval: Interval;
  setNewInterval: (interval: Interval) => void;
  newRepeatGroup: RepeatGroup;
  setNewRepeatGroup: (group: RepeatGroup) => void;
  resetBuilderWorkout: () => void;
  addWorkoutItem: (isRepeatMode: boolean) => void;
  removeWorkoutItem: (idToRemove: number) => void;
  updateWorkoutItem: (
    itemId: number,
    isRepeatMode: boolean,
    updatedInterval: Interval | RepeatGroup
  ) => void;
  reorderWorkoutItems: (newOrder: WorkoutItem[]) => void;
  setIsEditing: (isEditing: boolean) => void;
  initializeWorkout: (existingWorkout: Workout | null) => void;
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
  const [isLoadingCreateOrUpdateWorkout, setIsLoadingCreateOrUpdateWorkout] =
    useState(false);
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

  const createWorkoutMutation = useCreateWorkout();
  const updateWorkoutMutation = useUpdateWorkout();

  const createOrUpdateWorkout = async (
    workoutData: CreateWorkoutInput | UpdateWorkoutInput,
    isEditing: boolean
  ) => {
    console.log("createOrUpdateWorkout", workoutData, isEditing);
    try {
      const workoutId = isEditing
        ? (workoutData as UpdateWorkoutInput).id.toString()
        : null;
      setIsLoadingCreateOrUpdateWorkout(
        createWorkoutMutation.isPending || updateWorkoutMutation.isPending
      );
      const workout =
        isEditing && workoutId
          ? await updateWorkoutMutation.mutateAsync({
              workoutId,
              workoutData: workoutData as UpdateWorkoutInput,
            })
          : await createWorkoutMutation.mutateAsync(
              workoutData as CreateWorkoutInput
            );

      toast.success(isEditing ? "Workout updated!" : "Workout created!");
      return workout as Workout;
    } catch (error) {
      console.error("Error saving workout:", error);
      toast.error(
        isEditing
          ? "Failed to update workout: " + error
          : "Failed to create workout: " + error
      );
      throw error;
    }
  };

  // Add builder-specific state
  const defaultEmptyWorkout = {
    title: "",
    description: "",
    type: WorkoutType.RUN,
    items: [],
  };

  const [builderWorkout, setBuilderWorkout] =
    useState<Workout>(defaultEmptyWorkout);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkoutItem | null>(null);
  const [newInterval, setNewInterval] = useState<Interval>({
    type: IntervalType.ACTIVE,
    durationType: DurationType.TIME,
    durationValue: 0,
    durationUnit: "minutes",
    intensityType: IntensityType.NONE,
    intensityMin: "",
    intensityMax: "",
  });
  const [newRepeatGroup, setNewRepeatGroup] = useState<RepeatGroup>({
    intervals: [newInterval],
    repeats: 1,
  });

  const resetBuilderWorkout = useCallback(() => {
    setBuilderWorkout(defaultEmptyWorkout);
    setIsEditing(false);
    setEditingItem(null);
  }, []);

  const addWorkoutItem = useCallback(
    (isRepeatMode: boolean) => {
      const newId = builderWorkout.items.length + 1;
      if (isRepeatMode) {
        setBuilderWorkout((prev) => ({
          ...prev,
          items: [
            ...prev.items,
            {
              id: newId,
              order: prev.items.length,
              repeatGroup: newRepeatGroup,
            },
          ],
        }));
        setNewRepeatGroup({
          intervals: [newInterval],
          repeats: 1,
        });
      } else {
        setBuilderWorkout((prev) => ({
          ...prev,
          items: [
            ...prev.items,
            { id: newId, order: prev.items.length, interval: newInterval },
          ],
        }));
        setNewInterval({
          type: IntervalType.ACTIVE,
          durationType: DurationType.TIME,
          durationValue: 0,
          durationUnit: "minutes",
          intensityType: IntensityType.NONE,
          intensityMin: "",
          intensityMax: "",
        });
      }
    },
    [builderWorkout.items.length, newInterval, newRepeatGroup]
  );

  const removeWorkoutItem = useCallback((idToRemove: number) => {
    setBuilderWorkout((prev) => ({
      ...prev,
      items: prev.items
        .filter((item) => item.id !== idToRemove)
        .map((item, index) => ({ ...item, order: index })),
    }));
  }, []);

  const updateWorkoutItem = useCallback(
    (
      itemId: number,
      isRepeatMode: boolean,
      updatedInterval: Interval | RepeatGroup
    ) => {
      setBuilderWorkout((prev) => ({
        ...prev,
        items: prev.items.map((item) => {
          if (item.id === itemId) {
            return isRepeatMode
              ? { ...item, repeatGroup: updatedInterval as RepeatGroup }
              : { ...item, interval: updatedInterval as Interval };
          }
          return item;
        }),
      }));
    },
    []
  );

  const reorderWorkoutItems = useCallback((newOrder: WorkoutItem[]) => {
    setBuilderWorkout((prev) => ({
      ...prev,
      items: newOrder.map((item, index) => ({ ...item, order: index })),
    }));
  }, []);

  const initializeWorkout = useCallback((existingWorkout: Workout | null) => {
    if (existingWorkout) {
      setBuilderWorkout(existingWorkout);
      setIsEditing(true);
    } else {
      setBuilderWorkout(defaultEmptyWorkout);
      setIsEditing(false);
    }
    setEditingItem(null);
  }, []);

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
        createOrUpdateWorkout,
        isLoadingCreateOrUpdateWorkout,
        builderWorkout,
        setBuilderWorkout,
        isEditing,
        editingItem,
        setEditingItem,
        newInterval,
        setNewInterval,
        newRepeatGroup,
        setNewRepeatGroup,
        resetBuilderWorkout,
        addWorkoutItem,
        removeWorkoutItem,
        updateWorkoutItem,
        reorderWorkoutItems,
        setIsEditing,
        initializeWorkout,
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
