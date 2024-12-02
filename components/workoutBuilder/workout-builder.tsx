"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, PlusCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getIntervalColor } from "@/lib/workout-utils";
import IntervalForm from "../forms/interval-form";
import { useTheme } from "next-themes";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createWorkoutSchema,
  CreateWorkoutInput,
  UpdateWorkoutInput,
} from "@/schemas/workout-schema";
import {
  DurationType,
  IntensityType,
  IntervalType,
  Workout,
  WorkoutItem,
} from "@/types/workouts";
import { WorkoutType } from "@prisma/client";
import { MarkdownInput } from "@/components/markdown-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkout } from "@/app/contexts/WorkoutContext";
import { useForm } from "react-hook-form";
import { IntervalList } from "./interval-list";

interface WorkoutBuilderProps {
  existingWorkout?: Workout | null;
  onSave?: (workout?: Workout | undefined) => void | Promise<void>;
}

export function WorkoutBuilder({
  existingWorkout = null,
  onSave,
}: WorkoutBuilderProps) {
  const { theme } = useTheme();
  const {
    builderWorkout: workout,
    setBuilderWorkout: setWorkout,
    isEditing,
    editingItem,
    setEditingItem,
    newInterval,
    setNewInterval,
    newRepeatGroup,
    setNewRepeatGroup,
    addWorkoutItem,
    removeWorkoutItem,
    updateWorkoutItem,
    createOrUpdateWorkout,
    isLoadingCreateOrUpdateWorkout: isLoading,
    initializeWorkout,
  } = useWorkout();

  const [isIntervalDialogOpen, setIsIntervalDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isRepeatMode, setIsRepeatMode] = useState(false);

  const defaultEmptyWorkout = {
    title: "",
    description: "",
    type: WorkoutType.RUN,
    items: [],
  };

  const form = useForm<CreateWorkoutInput>({
    resolver: zodResolver(createWorkoutSchema),
    defaultValues: existingWorkout ?? defaultEmptyWorkout,
  });

  // Use useEffect to initialize the workout
  useEffect(() => {
    initializeWorkout(existingWorkout);
  }, [existingWorkout, initializeWorkout]);

  const handleSubmitWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitDialogOpen(false);

    const data = form.getValues();
    const workoutData: CreateWorkoutInput | UpdateWorkoutInput = {
      id: isEditing ? existingWorkout?.id : undefined,
      title: data.title,
      description: data.description,
      type: data.type,
      items: workout.items,
    };

    try {
      const savedWorkout = await createOrUpdateWorkout(workoutData, isEditing);
      if (onSave) {
        onSave(savedWorkout);
      }
    } catch (error) {
      console.error("Error saving workout:", error);
    }
  };

  const handleAddItem = () => {
    addWorkoutItem(isRepeatMode);
    setIsIntervalDialogOpen(false);
  };

  const handleEditWorkoutItem = (item: WorkoutItem) => {
    setEditingItem(item);
    if (item.repeatGroup) {
      setIsRepeatMode(true);
      setNewRepeatGroup(item.repeatGroup);
      if (item.repeatGroup.intervals.length > 0) {
        const targetInterval = item.interval
          ? item.repeatGroup.intervals.find(
              (i) => i.id === item?.interval?.id
            ) ||
            item.repeatGroup.intervals[
              item.repeatGroup.intervals.findIndex(
                (i) => JSON.stringify(i) === JSON.stringify(item.interval)
              )
            ]
          : item.repeatGroup.intervals[0];

        setNewInterval(targetInterval);
      }
    } else if (item.interval) {
      setIsRepeatMode(false);
      setNewInterval(item.interval);
    }
    setIsIntervalDialogOpen(true);
  };

  const handleUpdateItem = () => {
    if (editingItem) {
      if (isRepeatMode) {
        const updatedIntervals = newRepeatGroup.intervals.map(
          (interval, index) => {
            if (interval.id && newInterval.id) {
              return interval.id === newInterval.id ? newInterval : interval;
            }
            return JSON.stringify(interval) === JSON.stringify(newInterval)
              ? newInterval
              : interval;
          }
        );
        setNewRepeatGroup({ ...newRepeatGroup, intervals: updatedIntervals });
      }
      updateWorkoutItem(
        editingItem.id ?? 0,
        isRepeatMode,
        isRepeatMode ? newRepeatGroup : newInterval
      );
    } else {
      handleAddItem();
    }
    setIsIntervalDialogOpen(false);
    setEditingItem(null);
  };

  const handleReorder = (newOrder: WorkoutItem[]) => {
    const updatedWorkout: Workout = {
      ...workout,
      items: newOrder.map((item, index) => ({ ...item, order: index })),
    };
    setWorkout(updatedWorkout);
  };

  const moveInterval = (id: number, direction: "up" | "down") => {
    const index = workout.items.findIndex((item) => item.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === workout.items.length - 1)
    ) {
      return setWorkout(workout);
    }

    const newItems = [...workout.items];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newItems[index], newItems[swapIndex]] = [
      newItems[swapIndex],
      newItems[index],
    ];

    const updatedWorkout: Workout = {
      ...workout,
      items: newItems,
    };
    setWorkout(updatedWorkout);
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Workout Builder</h1>
      <form className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Workout Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={handleSubmitWorkout} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select workout type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={WorkoutType.RUN}>Run</SelectItem>
                          <SelectItem value={WorkoutType.BIKE}>Bike</SelectItem>
                          <SelectItem value={WorkoutType.SWIM}>Swim</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MarkdownInput
                          isEditable={true}
                          value={field.value}
                          onChange={field.onChange}
                          label="Description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        <IntervalList
          items={workout.items}
          onReorder={handleReorder}
          onRemoveInterval={removeWorkoutItem}
          onEditInterval={handleEditWorkoutItem}
          onMoveInterval={moveInterval}
        />

        <div className="flex justify-between items-center mt-4">
          <Dialog
            open={isIntervalDialogOpen}
            onOpenChange={setIsIntervalDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isLoading}
                onClick={() => {
                  setEditingItem(null);
                  setIsIntervalDialogOpen(true);
                  setIsRepeatMode(false);
                  setNewInterval({
                    id: workout.items.length + 1,
                    type: IntervalType.ACTIVE,
                    durationType: DurationType.TIME,
                    durationValue: 0,
                    durationUnit: "minutes",
                    intensityType: IntensityType.NONE,
                    intensityMin: "",
                    intensityMax: "",
                  });
                  setNewRepeatGroup({
                    intervals: [newInterval],
                    repeats: 1,
                  });
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Interval
              </Button>
            </DialogTrigger>
            <DialogContent
              className={`sm:max-w-[425px] ${
                theme === "dark"
                  ? "bg-gray-800 text-white"
                  : " bg-blue-600 bg-white text-black"
              }`}
            >
              <DialogHeader>
                <DialogTitle>
                  {editingItem
                    ? isRepeatMode
                      ? "Edit Repeat Group"
                      : "Edit Interval"
                    : isRepeatMode
                    ? "Add New Repeat"
                    : "Add New Interval"}
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-4">
                {isRepeatMode ? (
                  <div className="grid gap-4">
                    {newRepeatGroup.intervals.map((interval, index) => (
                      <div
                        key={interval.id}
                        className={`p-4 rounded-md ${getIntervalColor(
                          interval.type
                        )}`}
                      >
                        <IntervalForm
                          interval={interval}
                          onChange={(updatedInterval) => {
                            setNewRepeatGroup({
                              ...newRepeatGroup,
                              intervals: newRepeatGroup.intervals.map((i) =>
                                i.id === interval.id ? updatedInterval : i
                              ),
                            });
                          }}
                          onRemove={
                            newRepeatGroup.intervals.length > 1
                              ? () => {
                                  const filteredIntervals =
                                    newRepeatGroup.intervals.filter(
                                      (i) => i.id !== interval.id
                                    );
                                  setNewRepeatGroup({
                                    ...newRepeatGroup,
                                    intervals: filteredIntervals,
                                  });
                                }
                              : undefined
                          }
                        />
                        {index < newRepeatGroup.intervals.length - 1 && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() => {
                        const newInterval = {
                          id: newRepeatGroup.intervals.length + 1,
                          type: IntervalType.ACTIVE,
                          durationType: DurationType.TIME,
                          durationValue: 0,
                          durationUnit: "MINUTES",
                          intensityType: IntensityType.NONE,
                          intensityMin: "",
                          intensityMax: "",
                        };
                        setNewRepeatGroup({
                          ...newRepeatGroup,
                          intervals: [...newRepeatGroup.intervals, newInterval],
                        });
                      }}
                    >
                      Add Interval to Repeat
                    </Button>
                    <div>
                      <Label htmlFor="repeats">Number of Repeats</Label>
                      <Input
                        id="repeats"
                        type="number"
                        value={newRepeatGroup.repeats}
                        onChange={(e) => {
                          setNewRepeatGroup({
                            ...newRepeatGroup,
                            repeats: Number(e.target.value),
                          });
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <IntervalForm
                    interval={newInterval}
                    onChange={setNewInterval}
                  />
                )}
              </ScrollArea>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableRepeat"
                    checked={isRepeatMode}
                    onCheckedChange={setIsRepeatMode}
                    disabled={!!editingItem}
                  />
                  <Label htmlFor="enableRepeat">Enable Repeat</Label>
                </div>
                <Button type="button" onClick={handleUpdateItem}>
                  {editingItem
                    ? "Update"
                    : isRepeatMode
                    ? "Add Repeat"
                    : "Add Interval"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Button
          type="button"
          className="w-full"
          onClick={() => setIsSubmitDialogOpen(true)}
          disabled={isLoading}
        >
          {isEditing ? "Update Workout" : "Create Workout"}
        </Button>

        {/* Submit Dialog */}
        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Update Workout" : "Create Workout"}
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to {isEditing ? "update" : "create"} this
                workout?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSubmitDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmitWorkout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  "Confirm Update"
                ) : (
                  "Confirm Create"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </form>
    </div>
  );
}
