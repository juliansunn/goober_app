"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Reorder } from "framer-motion";
import { Loader2, Bot, PlusCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import * as z from "zod";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import IntervalItem from "./interval-item";
import { getIntervalColor } from "@/lib/workout-utils";
import IntervalForm from "./forms/interval-form";
import { useTheme } from "next-themes";
import { createWorkout, updateWorkout } from "@/functions/workouts";

import {
  createWorkoutSchema,
  CreateWorkoutInput,
  UpdateWorkoutInput,
} from "@/schemas/workout-schema";
import {
  DurationType,
  IntensityType,
  Interval,
  IntervalType,
  Workout,
  RepeatGroup,
  WorkoutItem,
} from "@/types/workouts";
import { toast } from "sonner";
import { WorkoutType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { MarkdownInput } from "@/components/markdown-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WorkoutBuilderProps {
  existingWorkout?: Workout | null;
  onSave?: (workout?: Workout | undefined) => void | Promise<void>;
}

export function WorkoutBuilder({
  existingWorkout = null,
  onSave,
}: WorkoutBuilderProps) {
  const { theme } = useTheme();
  const [workout, setWorkout] = useState<Workout>(
    existingWorkout || {
      title: "",
      description: "",
      type: WorkoutType.RUN,
      items: [],
    }
  );

  const [isIntervalDialogOpen, setIsIntervalDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isRepeatMode, setIsRepeatMode] = useState(false);
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
  const [editingItem, setEditingItem] = useState<WorkoutItem | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!!existingWorkout);

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

  // Use useEffect to update form values when existingWorkout changes
  useEffect(() => {
    if (existingWorkout) {
      form.reset({
        title: existingWorkout.title,
        description: existingWorkout.description,
        type: existingWorkout.type,
      });
      setWorkout(existingWorkout);
    }
  }, [existingWorkout, form]);

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/generate-workout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Update the workout state
      setWorkout(data.workout);

      // Update the form values
      form.reset({
        title: data.workout.title,
        description: data.workout.description,
        type: data.workout.type,
        items: data.workout.items,
      });
    } catch (error) {
      console.error("Error generating workout:", error);
      toast("error");
    } finally {
      setIsAiLoading(false);
    }
  };

  const createWorkoutMutation = useMutation({
    mutationFn: createWorkout,
    onSuccess: handleWorkoutSuccess,
    onError: handleWorkoutError,
  });

  const updateWorkoutMutation = useMutation({
    mutationFn: (data: UpdateWorkoutInput) =>
      updateWorkout(existingWorkout!.id!.toString(), data),
    onSuccess: handleWorkoutSuccess,
    onError: handleWorkoutError,
  });

  function handleWorkoutSuccess(workout: Workout) {
    toast(
      isEditing
        ? "Workout updated successfully!"
        : "Workout created successfully!"
    );
    if (onSave) {
      onSave(workout);
    }
    resetForm();
  }

  function handleWorkoutError(error: Error) {
    console.error(
      isEditing ? "Error updating workout:" : "Error creating workout:",
      error
    );
    toast(isEditing ? "Failed to update workout" : "Failed to create workout");
  }

  function resetForm() {
    form.reset(defaultEmptyWorkout);
    setWorkout(defaultEmptyWorkout);
    setIsEditing(false);
  }

  const handleSubmitWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitDialogOpen(false);

    const data = form.getValues();
    const workoutData: CreateWorkoutInput | UpdateWorkoutInput = {
      title: data.title,
      description: data.description,
      type: data.type,
      items: workout.items
        .filter((item) => item.interval || item.repeatGroup)
        .map((item) => ({
          id: item.id ?? Date.now(),
          order: item.order,
          ...(item.interval && {
            interval: {
              type: item.interval.type as IntervalType,
              durationType: item.interval.durationType as DurationType,
              durationValue: item.interval.durationValue ?? 0,
              durationUnit: item.interval.durationUnit ?? "",
              intensityType: item.interval.intensityType as IntensityType,
              intensityMin: item.interval.intensityMin,
              intensityMax: item.interval.intensityMax,
            },
          }),
          ...(item.repeatGroup && { repeatGroup: item.repeatGroup }),
        })),
    };

    if (isEditing && existingWorkout?.id) {
      updateWorkoutMutation.mutate(workoutData as UpdateWorkoutInput);
    } else {
      createWorkoutMutation.mutate(workoutData as CreateWorkoutInput);
    }
  };

  const addItem = () => {
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
      setNewInterval((prev) => ({
        id: (prev?.id ?? 0) + 1,
        type: IntervalType.ACTIVE,
        durationType: DurationType.TIME,
        durationValue: 0,
        durationUnit: "minutes",
        intensityType: IntensityType.NONE,
        intensityMin: "",
        intensityMax: "",
      }));
    }
    setIsIntervalDialogOpen(false);
  };

  const removeInterval = useCallback((idToRemove: number) => {
    setWorkout((prev) => ({
      ...prev,
      items: prev.items
        .filter((item) => item.id !== idToRemove)
        .map((item, index) => ({ ...item, order: index })),
    }));
  }, []);

  const editInterval = useCallback((item: WorkoutItem) => {
    setEditingItem(item);
    if (item.repeatGroup) {
      setIsRepeatMode(true);
      setNewRepeatGroup(item.repeatGroup);
    } else if (item.interval) {
      setIsRepeatMode(false);
      setNewInterval(item.interval);
    }
    setIsIntervalDialogOpen(true);
  }, []);

  const updateItem = () => {
    if (editingItem) {
      setWorkout((prev) => ({
        ...prev,
        items: prev.items.map((item) => {
          if (item.id === editingItem.id) {
            return isRepeatMode
              ? { ...item, repeatGroup: newRepeatGroup }
              : { ...item, interval: newInterval };
          }
          return item;
        }),
      }));
    } else {
      addItem();
    }
    setIsIntervalDialogOpen(false);
    setEditingItem(null);
  };

  useEffect(() => {
    if (isRepeatMode) {
      setNewRepeatGroup((prev) => ({
        ...prev,
        intervals: [newInterval, ...prev.intervals.slice(1)],
      }));
    }
  }, [newInterval, isRepeatMode]);

  const handleReorder = (newOrder: WorkoutItem[]) => {
    setWorkout((prev) => ({
      ...prev,
      items: newOrder.map((item, index) => ({ ...item, order: index })),
    }));
  };

  const moveInterval = (id: number, direction: "up" | "down") => {
    setWorkout((prev) => {
      const index = prev.items.findIndex((item) => item.id === id);
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === prev.items.length - 1)
      ) {
        return prev; // Do nothing if trying to move beyond array bounds
      }

      const newItems = [...prev.items];
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      [newItems[index], newItems[swapIndex]] = [
        newItems[swapIndex],
        newItems[index],
      ];

      return { ...prev, items: newItems };
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Workout Builder</h1>
      <form className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Workout Details</CardTitle>
            <CardDescription>
              Enter the basic information for your workout
            </CardDescription>
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
                      <FormLabel>Description</FormLabel>
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

        <Card>
          <CardHeader>
            <CardTitle>Intervals</CardTitle>
            <CardDescription>
              Build your workout by adding intervals
            </CardDescription>
            <div className="flex justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Bot className="h-6 w-6" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <form
                          onSubmit={handlePromptSubmit}
                          className="space-y-4"
                        >
                          <h3 className="font-semibold">
                            AI Workout Assistant
                          </h3>
                          <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the workout you want (e.g., '30-minute HIIT for beginners')"
                            disabled={isAiLoading}
                          />
                          <Button type="submit" disabled={isAiLoading}>
                            {isAiLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              "Generate Workout"
                            )}
                          </Button>
                        </form>
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Need help creating your workout?</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Reorder.Group
              axis="y"
              values={workout.items}
              onReorder={handleReorder}
            >
              <div className="grid gap-2">
                {workout.items.map((item, index) => {
                  const workoutItem = item.interval
                    ? item.interval
                    : item.repeatGroup;
                  if (!workoutItem) return null;
                  if (item.id === undefined) return null;
                  return (
                    <Reorder.Item key={item.id} value={item}>
                      <IntervalItem
                        item={workoutItem}
                        removeInterval={() => removeInterval(item.id ?? 0)}
                        editInterval={() => editInterval(item)}
                        moveUp={() => moveInterval(item.id ?? 0, "up")}
                        moveDown={() => moveInterval(item.id ?? 0, "down")}
                        isFirst={index === 0}
                        isLast={index === workout.items.length - 1}
                      />
                    </Reorder.Item>
                  );
                })}
              </div>
            </Reorder.Group>

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
                    disabled={
                      createWorkoutMutation.isPending ||
                      updateWorkoutMutation.isPending
                    }
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
                                setNewRepeatGroup((prev) => ({
                                  ...prev,
                                  intervals: prev.intervals.map((i) =>
                                    i.id === interval.id ? updatedInterval : i
                                  ),
                                }));
                                if (index === 0) {
                                  setNewInterval(updatedInterval);
                                }
                              }}
                              onRemove={
                                newRepeatGroup.intervals.length > 1
                                  ? () => {
                                      setNewRepeatGroup((prev) => ({
                                        ...prev,
                                        intervals: prev.intervals.filter(
                                          (i) => i.id !== interval.id
                                        ),
                                      }));
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
                          type="button" // Prevent form submission
                          onClick={() =>
                            setNewRepeatGroup((prev) => ({
                              ...prev,
                              intervals: [
                                ...prev.intervals,
                                {
                                  id: prev.intervals.length + 1,
                                  type: IntervalType.ACTIVE,
                                  durationType: DurationType.TIME,
                                  durationValue: 0,
                                  durationUnit: "minutes",
                                  intensityType: IntensityType.NONE,
                                  intensityMin: "",
                                  intensityMax: "",
                                },
                              ],
                            }))
                          }
                        >
                          Add Interval to Repeat
                        </Button>
                        <div>
                          <Label htmlFor="repeats">Number of Repeats</Label>
                          <Input
                            id="repeats"
                            type="number"
                            value={newRepeatGroup.repeats}
                            onChange={(e) =>
                              setNewRepeatGroup((prev) => ({
                                ...prev,
                                repeats: Number(e.target.value),
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="addRestInterval"
                            checked={!!newRepeatGroup.restInterval}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewRepeatGroup((prev) => ({
                                  ...prev,
                                  restInterval: {
                                    id: prev.intervals.length + 1,
                                    type: IntervalType.REST,
                                    durationType: DurationType.TIME,
                                    durationValue: 0,
                                    durationUnit: "minutes",
                                    intensityType: IntensityType.NONE,
                                    intensityMin: "",
                                    intensityMax: "",
                                  },
                                }));
                              } else {
                                setNewRepeatGroup((prev) => ({
                                  ...prev,
                                  restInterval: undefined,
                                }));
                              }
                            }}
                          />
                          <Label htmlFor="addRestInterval">
                            Add Rest Interval
                          </Label>
                        </div>
                        {newRepeatGroup.restInterval && (
                          <div
                            className={`p-4 rounded-md ${getIntervalColor(
                              IntervalType.REST
                            )}`}
                          >
                            <h4 className="font-semibold mb-2">
                              Rest Interval
                            </h4>
                            <IntervalForm
                              interval={newRepeatGroup.restInterval}
                              onChange={(updatedInterval) => {
                                setNewRepeatGroup((prev) => ({
                                  ...prev,
                                  restInterval: updatedInterval,
                                }));
                              }}
                            />
                          </div>
                        )}
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
                    <Button type="button" onClick={updateItem}>
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
          </CardContent>
        </Card>

        <Button
          type="button"
          className="w-full"
          onClick={() => setIsSubmitDialogOpen(true)}
          disabled={
            createWorkoutMutation.isPending || updateWorkoutMutation.isPending
          }
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
                disabled={
                  createWorkoutMutation.isPending ||
                  updateWorkoutMutation.isPending
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmitWorkout}
                disabled={
                  createWorkoutMutation.isPending ||
                  updateWorkoutMutation.isPending
                }
              >
                {createWorkoutMutation.isPending ||
                updateWorkoutMutation.isPending ? (
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
