import {
  IntervalType as PrismaIntervalType,
  WorkoutType as PrismaWorkoutType,
  DurationType as PrismaDurationType,
  IntensityType as PrismaIntensityType,
} from "@prisma/client";

export const IntervalType = PrismaIntervalType;
export type IntervalType = (typeof IntervalType)[keyof typeof IntervalType];

export const WorkoutType = PrismaWorkoutType;
export type WorkoutType = (typeof WorkoutType)[keyof typeof WorkoutType];

export const DurationType = PrismaDurationType;
export type DurationType = (typeof DurationType)[keyof typeof DurationType];

export const IntensityType = PrismaIntensityType;
export type IntensityType = (typeof IntensityType)[keyof typeof IntensityType];

export interface User {
  id: number;
  clerkId: string;
  username?: string | null;
  name?: string | null;
  email?: string | null;
  workouts?: Workout[]; // Authored workouts
  favorites?: Workout[]; // Favorited workouts
}

export type Interval = {
  id?: number;
  type: IntervalType;
  durationType: DurationType;
  durationValue: number;
  durationUnit: string;
  intensityType: IntensityType;
  intensityMin: string;
  intensityMax: string;
};

export type RepeatGroup = {
  id?: number;
  intervals: Interval[];
  repeats: number;
  restInterval?: Interval;
};

export type WorkoutItem = {
  id?: number;
  order: number;
  interval?: Interval;
  repeatGroup?: RepeatGroup;
};

export interface Workout {
  id?: number;
  title: string;
  description: string;
  type: WorkoutType;
  items: WorkoutItem[];
  author?: User;
  authorId?: number;
  favoritedBy?: User[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ScheduledWorkout extends Workout {
  scheduledAt: Date;
  user: User;
  workout: Workout;
}

export interface GeneratedScheduledWorkout extends ScheduledWorkout {
  notes: string;
}
