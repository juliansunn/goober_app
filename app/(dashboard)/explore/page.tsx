"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WorkoutBuilder } from "@/components/workout-builder";
import { Workout } from "@/types/workouts";
import { Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Explore = () => {
  const [prompt, setPrompt] = useState("");
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-workout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setWorkout(data.workout);
    } catch (error) {
      console.error("Error generating workout:", error);
      toast("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-center mb-8">
        <h1 className="text-4xl font-bold">Explore AI-Generated Workouts</h1>
      </div>

      <form onSubmit={handlePromptSubmit} className="mb-8">
        <div className="relative">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the workout you want (e.g., '30-minute HIIT for beginners')"
            disabled={isLoading}
            className="pr-16 rounded-3xl w-full min-h-[2.5rem] max-h-32 text-md resize-none overflow-hidden"
            style={{ paddingTop: "0.625rem", paddingBottom: "0.625rem" }}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="absolute right-0 top-0 h-full rounded-r-3xl px-5 bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Generate Workout"
          >
            {isLoading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <Bot className="h-7 w-7" />
            )}
          </Button>
        </div>
      </form>

      {isLoading && (
        <div className="flex justify-center items-center mt-8">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500 rounded-full animate-spin border-t-transparent"></div>
            <Bot className="animate-reverse-spin animate-pulse absolute inset-0 w-1/2 h-1/2 m-auto text-primary" />
          </div>
        </div>
      )}

      {workout && (
        <div>
          <WorkoutBuilder initialWorkout={workout} />
        </div>
      )}
    </div>
  );
};

export default Explore;
