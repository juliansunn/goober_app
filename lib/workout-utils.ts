import { IntensityType, IntervalType, WorkoutType } from "@/types/workouts";

export const getIntensityUnit = (type: IntensityType): string => {
  switch (type) {
    case IntensityType.CADENCE:
      return "rpm";
    case IntensityType.HEART_RATE:
      return "bpm";
    case IntensityType.POWER:
      return "watts";
    case IntensityType.PACE_MILE:
      return "min/mile";
    case IntensityType.PACE_KM:
      return "min/km";

    case IntensityType.PACE_400M:
      return "sec/400m";
    default:
      return "";
  }
};

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

export function replaceKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(replaceKeys); // Process each element in the array
  } else if (obj !== null && typeof obj === "object") {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => {
        // Replace keys "intervalId" and "repeatGroupId" with "id"
        const newKey =
          key === "intervalId" || key === "repeatGroupId" ? "id" : key;
        acc[newKey] = replaceKeys(value); // Recursively process nested objects/arrays
        return acc;
      },
      {} as Record<string, any>
    );
  }
  return obj; // Return primitive values as-is
}
