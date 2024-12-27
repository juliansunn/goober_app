import { useState } from "react";
import { WorkoutScheduleFormData, FormErrors } from "@/types/workout";
import { WorkoutType } from "@/types/workouts";
import {
  validateScheduleStep,
  validateTimeInput,
  formatGoalTime,
} from "@/utils/workout-validation";
import { useWorkout } from "@/app/contexts/WorkoutContext";

const initialFormData: WorkoutScheduleFormData = {
  scheduleTitle: "",
  startDate: new Date(),
  raceName: "",
  raceType: WorkoutType.RUN,
  raceDistance: "",
  customDistance: "",
  customDistanceUnit: "",
  raceDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  restDay: "",
  experienceLevel: "",
  goalTimeHours: "",
  goalTimeMinutes: "",
  goalTimeSeconds: "",
  additionalNotes: "",
};

export const useWorkoutForm = () => {
  const { generateSkeleton } = useWorkout();
  const [step, setStep] = useState(0);
  const [formData, setFormData] =
    useState<WorkoutScheduleFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showCustomDistance, setShowCustomDistance] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (
      ["goalTimeHours", "goalTimeMinutes", "goalTimeSeconds"].includes(name)
    ) {
      const type = name.replace("goalTime", "").toLowerCase() as
        | "hours"
        | "minutes"
        | "seconds";
      if (!validateTimeInput(value, type)) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "raceDistance") {
      setShowCustomDistance(value === "custom");
      if (value !== "custom") {
        setFormData((prev) => ({
          ...prev,
          customDistance: "",
          customDistanceUnit: "",
        }));
      }
    }
  };

  const handleDateChange = (name: string, date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date || new Date(),
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors = validateScheduleStep(currentStep, formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      const goalTime = formatGoalTime(
        formData.goalTimeHours,
        formData.goalTimeMinutes,
        formData.goalTimeSeconds
      );

      await generateSkeleton({
        ...formData,
        goalTime,
      });
    }
  };

  return {
    step,
    formData,
    errors,
    showCustomDistance,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleNext,
    handleBack,
    handleSubmit,
  };
};
