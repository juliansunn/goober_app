"use client";

import React, { useState } from "react";
import { WorkoutBuilder } from "@/components/workoutBuilder/workout-builder";
import { Workout } from "@/types/workouts";
import { Bot } from "lucide-react";
import { ExpandingPromptInput } from "@/components/CustomTextArea";
import { generateWorkout } from "@/functions/generators";

const Explore = () => {
  const [prompt, setPrompt] = useState("");
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  console.log("prompt", prompt);

  const handleGenerateWorkout = async () => {
    setIsLoading(true);
    const workout = await generateWorkout(prompt);

    setWorkout(workout);
    setIsLoading(false);
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
        <div className="flex justify-center items-center mt-8">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500 rounded-full animate-spin border-t-transparent"></div>
            <Bot className="animate-reverse-spin animate-pulse absolute inset-0 w-1/2 h-1/2 m-auto text-primary" />
          </div>
        </div>
      )}

      {workout && <WorkoutBuilder existingWorkout={workout} />}
    </div>
  );
};

export default Explore;
