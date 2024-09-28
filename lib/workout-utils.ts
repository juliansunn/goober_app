import { IntervalType, WorkoutType } from "@/types/workouts";

export function getIntervalColor(type: IntervalType): string {
  switch (type) {
    case IntervalType.ACTIVE:
      return "bg-green-200 dark:bg-green-900";
    case IntervalType.REST:
      return "bg-red-200 dark:bg-red-900";
    default:
      return "bg-gray-200 dark:bg-gray-800";
  }
}

export function getWorkoutColor(type: WorkoutType): string {
  switch (type) {
    case WorkoutType.RUN:
      return "bg-purple-200 dark:bg-purple-900";
    case WorkoutType.BIKE:
      return "bg-blue-200 dark:bg-blue-900";
    case WorkoutType.SWIM:
      return "bg-slate-200 dark:bg-slate-900";
    default:
      return "bg-gray-200 dark:bg-gray-800";
  }
}

export const getIntervalTextColor = (intervalType: IntervalType) => {
  switch (intervalType) {
    case IntervalType.ACTIVE:
      return "text-purple-900";
    default:
      return "text-slate-800";
  }
};

// export const formatIntensityTarget = (intensityTarget: IntensityType) => {
//   if (intensityTarget.type === IntensityType.NONE) return "None";
//   const { type, min, max } = intensityTarget;
//   const unit =
//     type === IntensityType.CADENCE
//       ? "rpm"
//       : type === IntensityType.HEART_RATE
//       ? "bpm"
//       : type === IntensityType.POWER
//       ? "watts"
//       : type === IntensityType.PACE_MILE
//       ? "min/mile"
//       : type === IntensityType.PACE_KM
//       ? "min/km"
//       : "sec/400m";
//   return `${
//     type.charAt(0).toUpperCase() + type.slice(1)
//   }: [${min}] to [${max}] ${unit}`;
// };
