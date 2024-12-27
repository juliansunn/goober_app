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
  WorkoutSkeleton,
} from "@/types";
import { DurationUnit } from "@/types/workouts";
import { workoutSkeletonService } from "@/services/workout-skeleton-service";
import { WorkoutSkeletonFormData } from "@/types/skeleton";

// Add this type definition
type GeneratedScheduledWorkout = ScheduledWorkout & { notes: string };

type WorkoutContextType = {
  generatedScheduledWorkouts: GeneratedScheduledWorkout[];
  setGeneratedScheduledWorkouts: React.Dispatch<
    React.SetStateAction<GeneratedScheduledWorkout[]>
  >;
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
  isGeneratingSkeleton: boolean;
  skeleton: WorkoutSkeleton | null;
  generateSkeleton: (formData: any) => Promise<void>;
  userSkeleton: WorkoutSkeletonFormData | null;
  isLoadingSkeleton: boolean;
  isSavingSkeleton: boolean;
  loadSkeleton: (id: string) => Promise<void>;
  updateSkeleton: (data: WorkoutSkeletonFormData) => Promise<boolean>;
  deleteSkeleton: () => Promise<boolean>;
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
  const [isGeneratingSkeleton, setIsGeneratingSkeleton] = useState(false);
  const [skeleton, setSkeleton] = useState<WorkoutSkeleton | null>(null);
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
        const errorText = await response.text();
        throw new Error(`Failed to generate workout schedule: ${errorText}`);
      }

      const data = await response.json();
      setGeneratedScheduledWorkouts(data?.scheduledWorkouts || []);
    } catch (error) {
      console.error("Error generating workout schedule:", error);
      toast.error("Failed to generate workout schedule");
    } finally {
      setIsLoadingScheduledWorkouts(false);
    }
  }, []);

  const generateSkeleton = useCallback(async (formData: any) => {
    setIsGeneratingSkeleton(true);
    try {
      const response = await fetch("/api/generate-skeleton", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: JSON.stringify(formData) }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate workout skeleton");
      }

      const data = await response.json();
      setSkeleton(data);
      toast.success("Workout schedule skeleton generated successfully!");
    } catch (error) {
      console.error("Error generating workout skeleton:", error);
      toast.error("Failed to generate workout schedule skeleton");
      throw error;
    } finally {
      setIsGeneratingSkeleton(false);
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
    try {
      const workoutId = isEditing
        ? (workoutData as UpdateWorkoutInput).id?.toString()
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
    durationUnit: DurationUnit.MINUTES,
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
  }, [defaultEmptyWorkout]);

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
          durationUnit: DurationUnit.MINUTES,
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

  const initializeWorkout = useCallback(
    (existingWorkout: Workout | null) => {
      if (existingWorkout) {
        setBuilderWorkout(existingWorkout);
        setIsEditing(true);
      } else {
        setBuilderWorkout(defaultEmptyWorkout);
        setIsEditing(false);
      }
      setEditingItem(null);
    },
    [defaultEmptyWorkout]
  );

  const [userSkeleton, setUserSkeleton] =
    useState<WorkoutSkeletonFormData | null>(null);
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(false);
  const [isSavingSkeleton, setIsSavingSkeleton] = useState(false);

  // Add skeleton CRUD operations
  const loadSkeleton = useCallback(async (id: string) => {
    try {
      setIsLoadingSkeleton(true);
      const data = await workoutSkeletonService.getById(id);
      setUserSkeleton(data);
    } catch (error) {
      toast.error("Failed to load workout schedule");
      console.error(error);
    } finally {
      setIsLoadingSkeleton(false);
    }
  }, []);

  const updateSkeleton = async (data: WorkoutSkeletonFormData) => {
    if (!userSkeleton?.id) return false;
    try {
      setIsSavingSkeleton(true);
      await workoutSkeletonService.update(userSkeleton.id, data);
      setUserSkeleton(data);
      toast.success("Workout schedule saved successfully!");
      return true;
    } catch (error) {
      toast.error("Failed to save workout schedule");
      console.error(error);
      return false;
    } finally {
      setIsSavingSkeleton(false);
    }
  };

  const deleteSkeleton = async () => {
    if (!userSkeleton?.id) return false;
    try {
      setIsSavingSkeleton(true);
      await workoutSkeletonService.delete(userSkeleton.id);
      toast.success("Workout schedule deleted successfully!");
      return true;
    } catch (error) {
      toast.error("Failed to delete workout schedule");
      console.error(error);
      return false;
    } finally {
      setIsSavingSkeleton(false);
    }
  };

  return (
    <WorkoutContext.Provider
      value={{
        generatedScheduledWorkouts,
        setGeneratedScheduledWorkouts,
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
        isEditing,
        setIsEditing,
        initializeWorkout,
        isGeneratingSkeleton,
        skeleton,
        generateSkeleton,
        userSkeleton,
        isLoadingSkeleton,
        isSavingSkeleton,
        loadSkeleton,
        updateSkeleton,
        deleteSkeleton,
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
