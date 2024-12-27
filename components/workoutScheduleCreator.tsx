"use client";

import React from "react";
import { useWorkout } from "@/app/contexts/WorkoutContext";
import { WorkoutSkeleton } from "./workoutSkeletonForm/WorkoutSkeleton";
import { CreateSkeletonForm } from "./CreateSkeletonForm";
import { useWorkoutForm } from "@/hooks/useWorkoutForm";
import { AiLoading } from "./ui/AiLoading";
import { TrainingPreferencesStep } from "./workoutSkeletonForm/TrainingPreferencesStep";
import { RaceDetailsStep } from "./workoutSkeletonForm/RaceDetailsStep";

export function WorkoutScheduleCreatorComponent() {
  const { isLoadingScheduledWorkouts, isGeneratingSkeleton, skeleton } =
    useWorkout();
  const {
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
  } = useWorkoutForm();

  const renderResult = () => {
    if (!skeleton) return <CreateSkeletonForm onSubmit={() => {}} />;
    return (
      <WorkoutSkeleton
        title={formData.scheduleTitle}
        type={formData.raceType}
        skeletonData={skeleton}
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
    return renderResult();
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {step === 0 && (
        <RaceDetailsStep
          formData={formData}
          errors={errors}
          showCustomDistance={showCustomDistance}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
          onDateChange={handleDateChange}
          onNext={handleNext}
        />
      )}
      {step === 1 && (
        <TrainingPreferencesStep
          formData={formData}
          errors={errors}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
          onBack={handleBack}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
