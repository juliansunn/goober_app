"use client";

import {
  WorkoutType,
  IntervalType,
  DurationType,
  IntensityType,
} from "@prisma/client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { getStravaActivities } from "@/functions/strava";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
  StravaActivity,
  Workout,
  WorkoutItem,
} from "@/types";
import { DurationUnit } from "@/types/workouts";
import { WorkoutSkeletonFormData } from "@/types/skeleton";

type WorkoutContextType = {
  setDateRange: (startDate: Date, endDate: Date) => void;
  stravaActivities: StravaActivity[] | undefined;
  isLoadingStrava: boolean;
  isFetchingStrava: boolean;
  stravaError: Error | null;
  calendarItems: CalendarItem[];
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
  userSkeleton: WorkoutSkeletonFormData | null;
  isLoadingSkeleton: boolean;
  isSavingSkeleton: boolean;
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [page, setPage] = useState(1);
  const [isLoadingCreateOrUpdateWorkout, setIsLoadingCreateOrUpdateWorkout] =
    useState(false);
  const perPage = 50;

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
    ...(stravaActivities?.map((activity) => ({
      itemType: "stravaActivity" as const,
      item: activity,
    })) || []),
  ];

  const queryClient = useQueryClient();
  const { toast } = useToast();

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

      toast({
        title: "Success",
        description: "Workout updated!",
      });
      return workout as Workout;
    } catch (error) {
      console.error("Error saving workout:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update workout: ${error}`,
      });
      throw error;
    }
  };

  const defaultEmptyWorkout = useMemo(
    () => ({
      title: "",
      description: "",
      type: WorkoutType.RUN,
      items: [],
    }),
    []
  );

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

  return (
    <WorkoutContext.Provider
      value={{
        setDateRange,
        stravaActivities,
        isLoadingStrava,
        isFetchingStrava,
        stravaError,
        calendarItems,
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
        userSkeleton,
        isLoadingSkeleton,
        isSavingSkeleton,
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
