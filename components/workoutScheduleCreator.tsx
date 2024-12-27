"use client";

import React, { useState } from "react";
import { useWorkout } from "@/app/contexts/WorkoutContext";
import { WorkoutSkeletonForm } from "./workoutSkeletonForm/WorkoutSkeletonForm";
import { useWorkoutForm } from "@/hooks/useWorkoutForm";
import { AiLoading } from "./ui/AiLoading";
import { TrainingPreferencesStep } from "./workoutSkeletonForm/TrainingPreferencesStep";
import { RaceDetailsStep } from "./workoutSkeletonForm/RaceDetailsStep";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Brain, PencilRuler } from "lucide-react";

export function WorkoutScheduleCreatorComponent() {
  const [step, setStep] = useState(0);
  const { isLoadingScheduledWorkouts, isGeneratingSkeleton, skeleton } =
    useWorkout();
  const {
    formData,
    errors,
    showCustomDistance,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleSubmit,
  } = useWorkoutForm();

  const handleManualCreate = () => {
    const initialSkeleton = {
      title: formData.scheduleTitle,
      type: formData.raceType,
      startDate: formData.startDate?.toISOString() ?? new Date().toISOString(),
      endDate: formData.raceDate?.toISOString() ?? new Date().toISOString(),
      description: formData.additionalNotes ?? "",
      phases: [],
    };

    return (
      <WorkoutSkeletonForm
        initialData={initialSkeleton}
        onSave={async (data) => {
          // Handle saving the skeleton
        }}
      />
    );
  };

  if (isLoadingScheduledWorkouts || isGeneratingSkeleton) {
    return (
      <AiLoading
        loadingText={
          isGeneratingSkeleton
            ? "Creating your personalized workout schedule..."
            : "Generating your workout schedule..."
        }
      />
    );
  }

  if (skeleton) {
    return (
      <WorkoutSkeletonForm
        initialData={{
          title: formData.scheduleTitle,
          type: formData.raceType,
          description: formData.additionalNotes ?? "",
          startDate:
            formData.startDate?.toISOString() ?? new Date().toISOString(),
          endDate: formData.raceDate?.toISOString() ?? new Date().toISOString(),
          phases: skeleton.phases,
        }}
        onSave={async (data) => {
          // Handle saving the skeleton
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
              onSubmit={() => {}}
            />

            <Separator className="my-6" />

            <div className="flex justify-between gap-4">
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={Object.keys(errors).length > 0}
              >
                <Brain className="mr-2 h-4 w-4" />
                Generate with AI
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleManualCreate}
                disabled={Object.keys(errors).length > 0}
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
