export enum IntervalType {
  WARMUP = "warmup",
  COOLDOWN = "cooldown",
  ACTIVE = "active",
  REST = "rest",
}

export enum WorkoutType {
  RUN = "run",
  BIKE = "bike",
  SWIM = "swim",
}

export enum DurationType {
  TIME = "time",
  DISTANCE = "distance",
  HEART_RATE = "heartRate",
  CALORIES = "calories",
}

export enum IntensityType {
  NONE = "none",
  CADENCE = "cadence",
  HEART_RATE = "heartRate",
  POWER = "power",
  PACE_MILE = "paceMile",
  PACE_KM = "paceKm",
  PACE_400M = "pace400m",
}

export interface Duration {
  type: DurationType;
  value: number;
  unit: string;
}

export interface IntensityTarget {
  type: IntensityType;
  min: string;
  max: string;
}

export interface Interval {
  id: number;
  type: IntervalType;
  duration: Duration;
  intensityTarget: IntensityTarget;
}

export interface RepeatGroup {
  id: number;
  intervals: Interval[];
  repeats: number;
  restInterval?: Interval;
}

export interface Workout {
  title: string;
  description: string;
  type: WorkoutType;
  intervals: (Interval | RepeatGroup)[];
}
