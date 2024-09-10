import { IntensityTarget, IntensityType, IntervalType } from "@/types/workouts";

export const getIntervalColor = (
  intervalType: IntervalType,
  isRepeat: boolean = false
) => {
  if (isRepeat) return "bg-purple-100";
  switch (intervalType) {
    case IntervalType.WARMUP:
      return "bg-blue-50";
    case IntervalType.ACTIVE:
      return "bg-purple-200";
    case IntervalType.COOLDOWN:
      return "bg-slate-100";
    case IntervalType.REST:
      return "bg-slate-50";
    default:
      return "";
  }
};

export const getIntervalTextColor = (intervalType: IntervalType) => {
  switch (intervalType) {
    case IntervalType.ACTIVE:
      return "text-purple-900";
    default:
      return "text-slate-800";
  }
};

export const formatIntensityTarget = (intensityTarget: IntensityTarget) => {
  if (intensityTarget.type === IntensityType.NONE) return "None";
  const { type, min, max } = intensityTarget;
  const unit =
    type === IntensityType.CADENCE
      ? "rpm"
      : type === IntensityType.HEART_RATE
      ? "bpm"
      : type === IntensityType.POWER
      ? "watts"
      : type === IntensityType.PACE_MILE
      ? "min/mile"
      : type === IntensityType.PACE_KM
      ? "min/km"
      : "sec/400m";
  return `${
    type.charAt(0).toUpperCase() + type.slice(1)
  }: [${min}] to [${max}] ${unit}`;
};
