import { z } from "zod";
import {
  WorkoutType,
  IntervalType,
  DurationType,
  IntensityType,
} from "../types/workouts";

// Interval schema
const intervalSchema = z.object({
  type: z.nativeEnum(IntervalType),
  durationType: z.nativeEnum(DurationType),
  durationValue: z.number().positive(),
  durationUnit: z.string(),
  intensityType: z.nativeEnum(IntensityType),
  intensityMin: z.string().optional(),
  intensityMax: z.string().optional(),
});

// RepeatGroup schema
const repeatGroupSchema = z.object({
  repeats: z.number().int().positive(),
  intervals: z
    .array(intervalSchema)
    .min(1, "At least one interval is required"),
});

// WorkoutItem schema
const workoutItemSchema = z.object({
  order: z.number().int().nonnegative(),
  interval: intervalSchema.optional(),
  repeatGroup: repeatGroupSchema.optional(),
});

// Workout schema for creation
export const createWorkoutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  type: z.nativeEnum(WorkoutType),
  items: z
    .array(workoutItemSchema)
    .min(1, "At least one workout item is required"),
});

// Workout schema for updates (all fields optional)
export const updateWorkoutSchema = createWorkoutSchema.partial();

// User schema
const userSchema = z.object({
  id: z.number(),
  clerkId: z.string(),
  username: z.string().nullable(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
});

// Full Workout schema (including fields added by the database)
export const fullWorkoutSchema = createWorkoutSchema.extend({
  id: z.number(),
  author: userSchema,
  authorId: z.number(),
  favoritedBy: z.array(userSchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Export types
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
export type FullWorkout = z.infer<typeof fullWorkoutSchema>;
export type WorkoutItem = z.infer<typeof workoutItemSchema>;
