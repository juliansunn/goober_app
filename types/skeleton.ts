import {
  PhaseObjective as PrismaPhaseObjective,
  WeekFocus as PrismaWeekFocus,
} from "@prisma/client";
import { WorkoutType } from "./workouts";

export const PhaseObjective = PrismaPhaseObjective;
export type PhaseObjective =
  (typeof PhaseObjective)[keyof typeof PhaseObjective];

export const WeekFocus = PrismaWeekFocus;
export type WeekFocus = (typeof WeekFocus)[keyof typeof WeekFocus];

interface Volume {
  value: number;
  unit: string;
}
interface Duration {
  minutes: number;
}

export interface Week {
  id?: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  focus: WeekFocus;
  description: string;
  volumeDistance: Volume;
  volumeDuration: Duration;
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

export interface GeneratedWeekOutlinePrompt {
  overallDescription: string;
  phaseObjective: PhaseObjective;
  phaseDescription: string;
  weekFocus: WeekFocus;
  weekDescription: string;
  startDate: string;
  endDate: string;
  focus: WeekFocus;
  volumeDistance: Volume;
  volumeDuration: Duration;
  raceType: WorkoutType;
  goalTime: string;
  experienceLevel: string;
  restDay: string | null;
  additionalNotes: string;
}
