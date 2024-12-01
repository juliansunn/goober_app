import { useState } from "react";
import { WorkoutType } from "@prisma/client";
import {
  Workout,
  Interval,
  IntervalType,
  DurationType,
  IntensityType,
  WorkoutItem,
  RepeatGroup,
} from "@/types/workouts";
import { useWorkout } from "@/app/contexts/WorkoutContext";

export function useWorkoutBuilder(existingWorkout: Workout | null = null) {
  const defaultEmptyWorkout = {
    title: "",
    description: "",
    type: WorkoutType.RUN,
    items: [],
  };

  const [workout, setWorkout] = useState<Workout>(
    existingWorkout || defaultEmptyWorkout
  );
  const [isEditing, setIsEditing] = useState(!!existingWorkout);
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

  const resetWorkout = () => {
    setWorkout(defaultEmptyWorkout);
    setIsEditing(false);
    setEditingItem(null);
  };

  const addWorkoutItem = (isRepeatMode: boolean) => {
    const newId = workout.items.length + 1;
    if (isRepeatMode) {
      setWorkout((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          { id: newId, order: prev.items.length, repeatGroup: newRepeatGroup },
        ],
      }));
      setNewRepeatGroup({
        intervals: [newInterval],
        repeats: 1,
      });
    } else {
      setWorkout((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          { id: newId, order: prev.items.length, interval: newInterval },
        ],
      }));
      resetNewInterval();
    }
  };

  const resetNewInterval = () => {
    setNewInterval({
      type: IntervalType.ACTIVE,
      durationType: DurationType.TIME,
      durationValue: 0,
      durationUnit: "minutes",
      intensityType: IntensityType.NONE,
      intensityMin: "",
      intensityMax: "",
    });
  };

  const removeWorkoutItem = (idToRemove: number) => {
    setWorkout((prev) => ({
      ...prev,
      items: prev.items
        .filter((item) => item.id !== idToRemove)
        .map((item, index) => ({ ...item, order: index })),
    }));
  };

  const updateWorkoutItem = (
    itemId: number,
    isRepeatMode: boolean,
    updatedInterval: Interval | RepeatGroup
  ) => {
    setWorkout((prev) => ({
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
  };

  const reorderWorkoutItems = (newOrder: WorkoutItem[]) => {
    setWorkout((prev) => ({
      ...prev,
      items: newOrder.map((item, index) => ({ ...item, order: index })),
    }));
  };

  return {
    workout,
    setWorkout,
    isEditing,
    editingItem,
    setEditingItem,
    newInterval,
    setNewInterval,
    newRepeatGroup,
    setNewRepeatGroup,
    resetWorkout,
    addWorkoutItem,
    removeWorkoutItem,
    updateWorkoutItem,
    reorderWorkoutItems,
  };
}
