"use client";

import React, { useState } from "react";
import { WorkoutBuilder } from "@/components/workoutBuilder/workout-builder";
import { Workout } from "@/types/workouts";
import { Bot } from "lucide-react";
import { ExpandingPromptInput } from "@/components/CustomTextArea";
import { generateWorkout } from "@/functions/generators";
import { AiLoading } from "@/components/ui/AiLoading";
import { useToast } from "@/hooks/use-toast";

const Explore = () => {
  const [prompt, setPrompt] = useState("");
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateWorkout = async () => {
    setIsLoading(true);
    try {
      const workout = await generateWorkout(prompt);
      setWorkout(workout);
      toast({
        title: "Workout generated successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error generating workout:", error);
      toast({
        title: "Failed to generate workout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-center mb-8">
        <h1 className="text-4xl font-bold">Explore AI-Generated Workouts</h1>
      </div>
      <ExpandingPromptInput
        onSubmit={handleGenerateWorkout}
        prompt={prompt}
        onChange={setPrompt}
        placeholder="Describe the workout you want (e.g., '30-minute HIIT for beginners')"
        isLoading={isLoading}
        icon={<Bot className="h-5 w-5" />}
      />

      {isLoading && (
        <AiLoading loadingText="Creating your personalized workout..." />
      )}

      {workout && <WorkoutBuilder existingWorkout={workout} />}
    </div>
  );
};

export default Explore;
