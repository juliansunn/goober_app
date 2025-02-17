"use client";

import { useWorkoutForm } from "@/hooks/useWorkoutForm";
import { WorkoutScheduleFormData } from "@/types/workout";
import { Brain, PencilRuler } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiLoading } from "./ui/AiLoading";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { RaceDetailsStep } from "./workoutSkeletonForm/RaceDetailsStep";
import { TrainingPreferencesStep } from "./workoutSkeletonForm/TrainingPreferencesStep";
import { WorkoutScheduleForm } from "./workoutSkeletonForm/WorkoutScheduleForm";
export function WorkoutScheduleCreatorComponent() {
  const [step, setStep] = useState(0);
  const { isLoadingScheduledWorkouts } = useWorkoutForm();
  const [initialData, setInitialData] =
    useState<WorkoutScheduleFormData | null>(null);
  const router = useRouter();

  const {
    formData,
    errors,
    showCustomDistance,
    isGeneratingWorkoutSchedule,
    skeleton,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleSubmit,
  } = useWorkoutForm();

  const handleManualCreate = () => {
    setInitialData({
      scheduleTitle: formData.scheduleTitle,
      startDate: formData.startDate,
      raceName: formData.raceName,
      raceType: formData.raceType,
      raceDistance: formData.raceDistance,
      customDistance: formData.customDistance,
      customDistanceUnit: formData.customDistanceUnit,
      raceDate: formData.raceDate,
      restDay: formData.restDay,
      experienceLevel: formData.experienceLevel,
      goalTimeHours: formData.goalTimeHours,
      goalTimeMinutes: formData.goalTimeMinutes,
      goalTimeSeconds: formData.goalTimeSeconds,
      additionalNotes: formData.additionalNotes,
    });
  };

  // Helper function to check if there are any actual errors
  const hasValidationErrors = (errors: Record<string, string>) => {
    return Object.values(errors).some((error) => error !== "");
  };

  if (isLoadingScheduledWorkouts || isGeneratingWorkoutSchedule) {
    return (
      <AiLoading
        loadingText={
          isGeneratingWorkoutSchedule
            ? "Creating your personalized workout schedule..."
            : "Generating your workout schedule..."
        }
      />
    );
  }

  if (skeleton) {
    return (
      <WorkoutScheduleForm
        initialData={{
          scheduleTitle: formData.scheduleTitle,
          startDate: formData.startDate,
          raceName: formData.raceName,
          raceType: formData.raceType,
          raceDistance: formData.raceDistance,
          customDistance: formData.customDistance,
          customDistanceUnit: formData.customDistanceUnit,
          raceDate: formData.raceDate,
          restDay: formData.restDay,
          experienceLevel: formData.experienceLevel,
          goalTimeHours: formData.goalTimeHours,
          goalTimeMinutes: formData.goalTimeMinutes,
          goalTimeSeconds: formData.goalTimeSeconds,
          additionalNotes: formData.additionalNotes,
          schedule: skeleton,
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {step === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <RaceDetailsStep
              formData={formData}
              errors={errors}
              showCustomDistance={showCustomDistance}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
              onDateChange={handleDateChange}
              onNext={() => setStep(1)}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <TrainingPreferencesStep
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
              onBack={() => setStep(0)}
            />

            <Separator className="my-6" />

            <div className="flex justify-between gap-4">
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={hasValidationErrors(errors)}
              >
                <Brain className="mr-2 h-4 w-4" />
                Generate with AI
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleManualCreate}
                disabled={hasValidationErrors(errors)}
              >
                <PencilRuler className="mr-2 h-4 w-4" />
                Build Manually
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
