import z from "zod";

import {
  DurationType,
  DurationUnit,
  IntensityType,
  IntervalType,
  WorkoutType,
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
export const DurationUnitSchema = z.enum(
  Object.values(DurationUnit) as [DurationUnit, ...DurationUnit[]]
);
export const IntensityTypeSchema = z.enum(
  Object.values(IntensityType) as [IntensityType, ...IntensityType[]]
);

const singleIntervalSchema = z.object({
  id: z.number().int(),
  order: z.number().int(),
  intervalType: IntervalTypeSchema,
  durationType: DurationTypeSchema,
  durationValue: z.number(),
  durationUnit: DurationUnitSchema,
  intensityType: IntensityTypeSchema,
  intensityMin: z.string(),
  intensityMax: z.string(),
});

export const workoutItemSchema = z.object({
  order: z.number().int(),
  type: z.enum(["interval", "repeatGroup"]).describe("The type of the item"), // Define valid types explicitly
  id: z.number().int().describe("The unique identifier of the item"),
  interval: singleIntervalSchema
    .optional()
    .describe("The interval of the item. Only present if the type is interval"), // Optional, only if type is "interval"
  repeatGroup: z
    .object({
      intervals: z.array(singleIntervalSchema),
      repeats: z.number().int(),
    })
    .optional()
    .describe(
      "The repeat group of the item. Only present if the type is repeatGroup"
    ), // Optional, only if type is "repeatGroup"
});

export const intervalSchema = z.object({
  intervalId: z
    .number()
    .int()
    .describe("The unique identifier of the interval"),
  order: z.number().int().describe("The order of the interval in the workout"),
  type: z.literal("interval"),
  interval: singleIntervalSchema,
});

export const repeatGroupSchema = z.object({
  repeatGroupId: z
    .number()
    .int()
    .describe("The unique identifier of the repeat group"),
  order: z
    .number()
    .int()
    .describe("The order of the repeat group in the workout"),
  type: z.literal("repeatGroup"),
  repeatGroup: z.object({
    intervals: z.array(singleIntervalSchema),
    repeats: z.number().int(),
  }),
});

export const workoutSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: WorkoutTypeSchema,
  items: z.array(workoutItemSchema),
});

// Define the schema for the scheduled workout
export const scheduledWorkoutSchema = z.object({
  scheduledAt: z.string(),
  notes: z.string(),
  workout: workoutSchema,
});
