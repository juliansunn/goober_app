"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
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
import {
  DurationType,
  IntensityType,
  Interval,
  IntervalType,
  RepeatGroup,
  Workout,
  WorkoutType,
} from "@/types/workouts";
import IntervalForm from "./forms/interval-form";

const workoutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  type: z.nativeEnum(WorkoutType),
});

export function WorkoutBuilder() {
  const [workout, setWorkout] = useState<Workout>({
    title: "",
    description: "",
    type: WorkoutType.RUN,
    intervals: [],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRepeatMode, setIsRepeatMode] = useState(false);
  const [newInterval, setNewInterval] = useState<Interval>({
    id: Date.now(),
    type: IntervalType.ACTIVE,
    duration: { type: DurationType.TIME, value: 0, unit: "minutes" },
    intensityTarget: { type: IntensityType.NONE, min: "", max: "" },
  });
  const [newRepeatGroup, setNewRepeatGroup] = useState<RepeatGroup>({
    id: Date.now(),
    intervals: [newInterval],
    repeats: 1,
  });
  const [editingItem, setEditingItem] = useState<Interval | RepeatGroup | null>(
    null
  );

  const form = useForm<z.infer<typeof workoutSchema>>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      title: "",
      description: "",
      type: WorkoutType.RUN,
    },
  });

  const addInterval = () => {
    if (isRepeatMode) {
      setWorkout((prev) => ({
        ...prev,
        intervals: [...prev.intervals, { ...newRepeatGroup, id: Date.now() }],
      }));
      setNewRepeatGroup({
        id: Date.now(),
        intervals: [newInterval],
        repeats: 1,
      });
    } else {
      setWorkout((prev) => ({
        ...prev,
        intervals: [...prev.intervals, { ...newInterval, id: Date.now() }],
      }));
      setNewInterval({
        id: Date.now(),
        type: IntervalType.ACTIVE,
        duration: { type: DurationType.TIME, value: 0, unit: "minutes" },
        intensityTarget: { type: IntensityType.NONE, min: "", max: "" },
      });
    }
    setIsDialogOpen(false);
  };

  const removeInterval = useCallback((id: number) => {
    console.log("Removing interval with id:", id);
    setWorkout((prev) => ({
      ...prev,
      intervals: prev.intervals.filter((item) => {
        if ("intervals" in item) {
          if (item.id === id) return false;
          item.intervals = item.intervals.filter(
            (interval) => interval.id !== id
          );
          return true;
        }
        return item.id !== id;
      }),
    }));
  }, []);

  const editInterval = useCallback((item: Interval | RepeatGroup) => {
    console.log("Editing item:", item);
    setEditingItem(item);
    if ("intervals" in item) {
      setIsRepeatMode(true);
      setNewRepeatGroup(item);
    } else {
      setIsRepeatMode(false);
      setNewInterval(item);
    }
    setIsDialogOpen(true);
  }, []);

  const updateItem = () => {
    if (editingItem) {
      setWorkout((prev) => ({
        ...prev,
        intervals: prev.intervals.map((item) => {
          if ("intervals" in item && "intervals" in editingItem) {
            return item.id === editingItem.id ? newRepeatGroup : item;
          } else if (!("intervals" in item) && !("intervals" in editingItem)) {
            return item.id === editingItem.id ? newInterval : item;
          }
          return item;
        }),
      }));
    } else {
      addInterval();
    }
    setIsDialogOpen(false);
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

  const getItemPos = (id: number) =>
    workout.intervals.findIndex((item) => item.id === id);

  function onSubmit(values: z.infer<typeof workoutSchema>) {
    const fullWorkout = {
      ...values,
      intervals: workout.intervals,
    };
    console.log(JSON.stringify(fullWorkout, null, 2));
  }

  const handleReorder = (newOrder: (Interval | RepeatGroup)[]) => {
    setWorkout((prev) => ({
      ...prev,
      intervals: newOrder,
    }));
  };

  const moveInterval = (id: number, direction: "up" | "down") => {
    setWorkout((prev) => {
      const index = prev.intervals.findIndex((item) => item.id === id);
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === prev.intervals.length - 1)
      ) {
        return prev; // Do nothing if trying to move beyond array bounds
      }

      const newIntervals = [...prev.intervals];
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      [newIntervals[index], newIntervals[swapIndex]] = [
        newIntervals[swapIndex],
        newIntervals[index],
      ];

      return { ...prev, intervals: newIntervals };
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Workout Builder</h1>
      <div className="grid gap-4 mb-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workout Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workout Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
                  <FormLabel>Workout Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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
          </form>
        </Form>
      </div>
      <Reorder.Group
        axis="y"
        values={workout.intervals}
        onReorder={handleReorder}
      >
        <div className="grid gap-2 mb-4">
          {workout.intervals.map((item, index) => (
            <Reorder.Item key={item.id} value={item}>
              <IntervalItem
                item={item}
                removeInterval={removeInterval}
                editInterval={editInterval}
                moveUp={() => moveInterval(item.id, "up")}
                moveDown={() => moveInterval(item.id, "down")}
                isFirst={index === 0}
                isLast={index === workout.intervals.length - 1}
              />
            </Reorder.Item>
          ))}
        </div>
      </Reorder.Group>

      <div className="flex justify-between items-center mt-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null);
                setIsDialogOpen(true);
                setIsRepeatMode(false);
                setNewInterval({
                  id: Date.now(),
                  type: IntervalType.ACTIVE,
                  duration: {
                    type: DurationType.TIME,
                    value: 0,
                    unit: "minutes",
                  },
                  intensityTarget: {
                    type: IntensityType.NONE,
                    min: "",
                    max: "",
                  },
                });
                setNewRepeatGroup({
                  id: Date.now(),
                  intervals: [newInterval],
                  repeats: 1,
                });
              }}
            >
              Add Interval
            </Button>
          </DialogTrigger>
          <DialogContent
            className={`sm:max-w-[425px] ${getIntervalColor(
              newInterval.type,
              isRepeatMode
            )}`}
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
                    onClick={() =>
                      setNewRepeatGroup((prev) => ({
                        ...prev,
                        intervals: [
                          ...prev.intervals,
                          {
                            id: Date.now(),
                            type: IntervalType.ACTIVE,
                            duration: {
                              type: DurationType.TIME,
                              value: 0,
                              unit: "minutes",
                            },
                            intensityTarget: {
                              type: IntensityType.NONE,
                              min: "",
                              max: "",
                            },
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
                              id: Date.now(),
                              type: IntervalType.REST,
                              duration: {
                                type: DurationType.TIME,
                                value: 0,
                                unit: "minutes",
                              },
                              intensityTarget: {
                                type: IntensityType.NONE,
                                min: "",
                                max: "",
                              },
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
                    <Label htmlFor="addRestInterval">Add Rest Interval</Label>
                  </div>
                  {newRepeatGroup.restInterval && (
                    <div
                      className={`p-4 rounded-md ${getIntervalColor(
                        IntervalType.REST
                      )}`}
                    >
                      <h4 className="font-semibold mb-2">Rest Interval</h4>
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
              <Button onClick={updateItem}>
                {editingItem
                  ? "Update"
                  : isRepeatMode
                  ? "Add Repeat"
                  : "Add Interval"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button onClick={() => console.log(JSON.stringify(workout, null, 2))}>
          Submit Workout
        </Button>
      </div>
    </div>
  );
}
