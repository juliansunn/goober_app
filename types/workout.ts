import { WorkoutSkeleton } from "./skeleton";
import { WorkoutType } from "./workouts";

export type DistanceOption = {
  label: string;
  value: string;
};

export type WorkoutScheduleFormData = {
  id?: number;
  scheduleTitle: string;
  startDate: string;
  raceDate: string;
  raceName: string;
  raceType: WorkoutType;
  raceDistance: string;
  customDistance: string;
  customDistanceUnit: string;
  restDay: string | null;
  experienceLevel: string;
  goalTimeHours: string;
  goalTimeMinutes: string;
  goalTimeSeconds: string;
  additionalNotes: string;
  schedule?: WorkoutSkeleton;
  createdAt?: string;
  updatedAt?: string;
};

export type FormErrors = Record<string, string>;
