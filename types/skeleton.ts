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
  weekNumber: number;
  startDate: string;
  endDate: string;
  focus: WeekFocus;
  description: string;
  volumeValue: number;
  volumeType: DurationType;
}

export interface Phase {
  name: string;
  startDate: string;
  endDate: string;
  objective: string;
  weeks: Week[];
}

export interface TrainingSchedule {
  description: string;
  startDate: string;
  endDate: string;
  phases: Phase[];
}

export interface WorkoutSkeleton {
  schedule: TrainingSchedule;
}

export interface WorkoutSkeletonFormData {
  title: string;
  type: WorkoutType;
  schedule: TrainingSchedule;
}
