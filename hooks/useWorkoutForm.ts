import { getScheduledWorkoutsList } from "@/functions/scheduled-workouts";
import {
  create,
  deleteScheduledWorkout,
  getAll,
  getById,
  update,
} from "@/functions/workout-schedules";
import { useToast } from "@/hooks/use-toast";
import { WorkoutSkeleton } from "@/types";
import { FormErrors, WorkoutScheduleFormData } from "@/types/workout";
import {
  GeneratedScheduledWorkout,
  ScheduledWorkout,
  WorkoutType,
} from "@/types/workouts";
import {
  validateScheduleStep,
  validateTimeInput,
} from "@/utils/workout-validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

const initialFormData: WorkoutScheduleFormData = {
  scheduleTitle: "",
  startDate: new Date().toISOString(),
  raceName: "",
  raceType: WorkoutType.RUN,
  raceDistance: "",
  customDistance: "",
  customDistanceUnit: "",
  raceDate: new Date(
    new Date().setMonth(new Date().getMonth() + 1)
  ).toISOString(),
  restDay: "",
  experienceLevel: "",
  goalTimeHours: "",
  goalTimeMinutes: "",
  goalTimeSeconds: "",
  goalTime: "",
  additionalNotes: "",
};

export const useWorkoutForm = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] =
    useState<WorkoutScheduleFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showCustomDistance, setShowCustomDistance] = useState(false);
  const [skeleton, setSkeleton] = useState<WorkoutSkeleton | null>(null);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const { toast } = useToast();

  // Queries
  const scheduledWorkoutsQuery = useQuery({
    queryKey: [
      "scheduled-workouts",
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () => getScheduledWorkoutsList({ startDate, endDate }),
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const workoutScheduleQuery = useQuery({
    queryKey: ["workout-schedule", formData.id],
    queryFn: async () => {
      try {
        return formData.id ? await getById(formData.id) : null;
      } catch (error) {
        console.error("Error loading workout schedule:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load workout schedule",
        });
        throw error;
      }
    },
    enabled: !!formData.id,
    select: (data) => {
      if (data) {
        setFormData(data);
      }
      return data;
    },
  });

  const workoutSchedulesQuery = useQuery({
    queryKey: ["workout-schedules"],
    queryFn: () => getAll(),
  });

  // Mutations
  const generateSkeletonMutation = useMutation({
    mutationFn: async (formData: WorkoutScheduleFormData) => {
      const response = await fetch("/api/generate-skeleton", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: JSON.stringify(formData) }),
      });
      if (!response.ok) throw new Error("Failed to generate workout skeleton");
      return response.json();
    },
    onSuccess: (data) => {
      setSkeleton(data.schedule);
      toast({
        title: "Success",
        description: "Workout schedule skeleton generated successfully!",
      });
    },
    onError: (error) => {
      console.error("Error generating workout skeleton:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate workout schedule skeleton",
      });
    },
  });

  const bulkCreateScheduledWorkoutsMutation = useMutation({
    mutationFn: async (workouts: ScheduledWorkout[]) => {
      const response = await fetch("/api/scheduled-workouts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workouts }),
      });
      if (!response.ok)
        throw new Error("Failed to bulk create scheduled workouts");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
      queryClient.setQueryData(["generated-schedules"], []);
      toast({
        title: "Success",
        description: "Workout schedule created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating workout schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create workout schedule",
      });
    },
  });

  const workoutScheduleMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id?: number;
      data: WorkoutScheduleFormData;
    }) => {
      if (id) {
        return update(id, data);
      }
      return create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-schedules"] });
      toast({
        title: "Success",
        description: "Workout schedule saved successfully!",
      });
    },
    onError: (error) => {
      console.error("Error saving workout schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save workout schedule",
      });
    },
  });

  const createWorkoutScheduleMutation = useMutation({
    mutationFn: (data: WorkoutScheduleFormData) => create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-schedules"] });
      toast({
        title: "Success",
        description: "Workout schedule created successfully!",
      });
    },
    onError: (error) => {
      console.error("Error creating workout schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create workout schedule",
      });
    },
  });

  const updateWorkoutScheduleMutation = useMutation({
    mutationFn: ({ data }: { data: Partial<WorkoutScheduleFormData> }) => {
      if (data.id) {
        return update(data.id, data);
      }
      return Promise.reject(new Error("Workout schedule ID is required"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-schedules"] });
      toast({
        title: "Success",
        description: "Workout schedule updated successfully!",
      });
    },
    onError: (error) => {
      console.error("Error updating workout schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update workout schedule",
      });
    },
  });

  const deleteWorkoutScheduleMutation = useMutation({
    mutationFn: (id: string) => deleteScheduledWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-schedules"] });
      toast({
        title: "Success",
        description: "Workout schedule deleted successfully!",
      });
      router.push("/schedules");
    },
    onError: (error) => {
      console.error("Error deleting workout schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete workout schedule",
      });
    },
  });

  // Form handling functions
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
      [name]: date?.toISOString() || new Date().toISOString(),
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
      await generateSkeletonMutation.mutateAsync({
        ...formData,
      });
    }
  };

  return {
    // Form state
    step,
    formData,
    errors,
    showCustomDistance,
    skeleton,

    // Loading states
    isGeneratingWorkoutSchedule: generateSkeletonMutation.isPending,
    isLoadingScheduledWorkouts: scheduledWorkoutsQuery.isLoading,
    isSavingWorkoutSchedule: workoutScheduleMutation.isPending,
    isLoadingSchedule: workoutScheduleQuery.isLoading,
    isLoadingWorkoutSchedules: workoutSchedulesQuery.isLoading,
    isDeletingWorkoutSchedule: deleteWorkoutScheduleMutation.isPending,

    // Data
    scheduledWorkouts: scheduledWorkoutsQuery.data,
    generatedScheduledWorkouts: queryClient.getQueryData([
      "generated-schedules",
    ]) as GeneratedScheduledWorkout[],
    workoutSchedules: workoutSchedulesQuery.data,

    // Handlers
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleNext,
    handleBack,
    handleSubmit,

    // Actions
    bulkCreateScheduledWorkouts: bulkCreateScheduledWorkoutsMutation.mutate,
    saveWorkoutSchedule: workoutScheduleMutation.mutate,
    loadSchedule: (id: number) => {
      setFormData((prev) => ({ ...prev, id }));
    },
    createWorkoutSchedule: createWorkoutScheduleMutation.mutate,
    updateWorkoutSchedule: updateWorkoutScheduleMutation.mutate,
    updateWorkoutSchedulePending: updateWorkoutScheduleMutation.isPending,
    deleteWorkoutSchedule: deleteWorkoutScheduleMutation.mutate,
  };
};
