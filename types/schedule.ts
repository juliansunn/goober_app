import z from "zod";

import {
  IntervalType,
  WorkoutType,
  DurationType,
  IntensityType,
} from "@/types/workouts";

// Define Zod schemas for enums
export const IntervalTypeSchema = z.enum(
  Object.values(IntervalType) as [IntervalType, ...IntervalType[]]
);
export const WorkoutTypeSchema = z.enum(
  Object.values(WorkoutType) as [WorkoutType, ...WorkoutType[]]
);
export const DurationTypeSchema = z.enum(
  Object.values(DurationType) as [DurationType, ...DurationType[]]
);
export const IntensityTypeSchema = z.enum(
  Object.values(IntensityType) as [IntensityType, ...IntensityType[]]
);

const singleIntervalSchema = z.object({
  id: z.number().int(),
  order: z.number().int(),
  type: IntervalTypeSchema,
  durationType: DurationTypeSchema,
  durationValue: z.number(),
  durationUnit: z.string(),
  intensityType: IntensityTypeSchema,
  intensityMin: z.string(),
  intensityMax: z.string(),
});

export const intervalSchema = z.object({
  id: z.number().int(),
  order: z.number().int(),
  interval: singleIntervalSchema,
});

export const repeatGroupSchema = z.object({
  id: z.number().int(),
  order: z.number().int(),
  repeatGroup: z.object({
    intervals: z.array(singleIntervalSchema),
    repeats: z.number().int(),
  }),
});

export const workoutSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: WorkoutTypeSchema,
  items: z.array(z.union([intervalSchema, repeatGroupSchema])),
});

// Define the schema for the scheduled workout
export const scheduledWorkoutSchema = z.object({
  scheduledAt: z.string(),
  notes: z.string(),
  workout: workoutSchema,
});
