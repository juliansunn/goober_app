import {
  PhaseObjective as PrismaPhaseObjective,
  WeekFocus as PrismaWeekFocus,
} from "@prisma/client";
import { DurationType, WorkoutType } from "./workouts";

export const PhaseObjective = PrismaPhaseObjective;
export type PhaseObjective =
  (typeof PhaseObjective)[keyof typeof PhaseObjective];

export const WeekFocus = PrismaWeekFocus;
export type WeekFocus = (typeof WeekFocus)[keyof typeof WeekFocus];

export interface Week {
  id?: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  focus: WeekFocus;
  description: string;
  volumeValue: number;
  volumeType: DurationType;
}

export interface Phase {
  id?: number;
  name: string;
  startDate: string;
  endDate: string;
  objective: PhaseObjective;
  weeks: Week[];
}

export interface TrainingSchedule {
  description: string;
  startDate: string;
  endDate: string;
  phases: Phase[];
}

export interface WorkoutSkeleton extends TrainingSchedule {}

export interface WorkoutSkeletonFormData extends TrainingSchedule {
  id?: string;
  title: string;
  type: WorkoutType;
}
