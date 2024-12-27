import { WorkoutType } from "@/types/workouts";
import { DistanceOption } from "@/types/workout";

export const raceDistances: Record<WorkoutType, DistanceOption[]> = {
  [WorkoutType.RUN]: [
    { label: "5K", value: "5K" },
    { label: "10K", value: "10K" },
    { label: "Half Marathon", value: "Half Marathon" },
    { label: "Marathon", value: "Marathon" },
    { label: "Custom", value: "custom" },
  ],
  [WorkoutType.BIKE]: [
    { label: "20K", value: "20K" },
    { label: "40K", value: "40K" },
    { label: "100K", value: "100K" },
    { label: "Century (100 miles)", value: "Century" },
    { label: "Custom", value: "custom" },
  ],
  [WorkoutType.SWIM]: [
    { label: "500m", value: "500m" },
    { label: "1500m", value: "1500m" },
    { label: "2.4 miles (Ironman)", value: "2.4 miles" },
    { label: "Custom", value: "custom" },
  ],
  [WorkoutType.TRIATHLON]: [
    { label: "Sprint", value: "Sprint" },
    { label: "Olympic", value: "Olympic" },
    { label: "Half Ironman", value: "Half Ironman" },
    { label: "Ironman", value: "Ironman" },
    { label: "Custom", value: "custom" },
  ],
};
