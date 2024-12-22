import { WorkoutScheduleFormData, FormErrors } from "@/types/workout";

export const validateScheduleStep = (
  currentStep: number,
  formData: WorkoutScheduleFormData
): FormErrors => {
  const errors: FormErrors = {};

  if (currentStep === 0) {
    if (!formData.raceName.trim()) errors.raceName = "Race name is required";
    if (!formData.raceType) errors.raceType = "Race type is required";
    if (!formData.raceDistance)
      errors.raceDistance = "Race distance is required";
    if (
      formData.raceDistance === "custom" &&
      (!formData.customDistance || !formData.customDistanceUnit)
    ) {
      errors.customDistance = "Custom distance and unit are required";
    }
    if (!formData.raceDate) errors.raceDate = "Race date is required";
  } else if (currentStep === 1) {
    if (!formData.experienceLevel)
      errors.experienceLevel = "Experience level is required";
  }

  return errors;
};

export const validateTimeInput = (
  value: string,
  type: "hours" | "minutes" | "seconds"
): boolean => {
  const numValue = parseInt(value, 10);
  if (isNaN(numValue) || numValue < 0) return false;
  if (type === "hours" && numValue > 99) return false;
  if ((type === "minutes" || type === "seconds") && numValue > 59) return false;
  return true;
};

export const formatGoalTime = (
  hours: string,
  minutes: string,
  seconds: string
): string => {
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
};
