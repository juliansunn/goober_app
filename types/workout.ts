import { WorkoutType } from "./workouts";

export type DistanceOption = {
  label: string;
  value: string;
};

export type WorkoutScheduleFormData = {
  scheduleTitle: string;
  startDate: Date;
  raceName: string;
  raceType: WorkoutType;
  raceDistance: string;
  customDistance: string;
  customDistanceUnit: string;
  raceDate: Date;
  restDay: string | null;
  experienceLevel: string;
  goalTimeHours: string;
  goalTimeMinutes: string;
  goalTimeSeconds: string;
  additionalNotes: string;
};

export type FormErrors = Record<string, string>;
