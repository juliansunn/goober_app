import { workoutSchema } from "@/schemas/schedule";
import { workoutSkeletonSchema } from "@/schemas/skeleton";
import { weekOutlineSchema } from "@/schemas/week-outline";
import { GeneratedWeekOutlinePrompt } from "@/types/skeleton";
import { WorkoutScheduleFormData } from "@/types/workout";
import * as Langtrace from "@langtrase/typescript-sdk";

import { createSDKClient, SDKModel } from "@/config/ai-models";
import {
  generateWeekDatesFromStartAndEndDate,
  getDaySlots,
} from "@/utils/date-utils";
import { generateObject } from "ai";
import fs from "fs/promises";
import * as openai from "openai";
import path from "path";

Langtrace.init({
  instrumentations: { openai },
  api_key: process.env.LANGTRACE_API_KEY as string,
});

interface ModelSelection {
  skeletonModel?: SDKModel;
  weekOutlineModel?: SDKModel;
  workoutModel?: SDKModel;
}

export async function generateSkeleton(
  prompt: WorkoutScheduleFormData,
  model: SDKModel
) {
  try {
    console.log(
      `🤖 Generating training plan skeleton using ${model.modelId}...`
    );

    const client = createSDKClient(model);

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const promptTemplate = await fs.readFile(
      path.join(process.cwd(), "prompts", "skeleton", "v0.0.1.txt"),
      "utf-8"
    );

    const weeks = generateWeekDatesFromStartAndEndDate(
      prompt.startDate,
      prompt.raceDate
    );

    const systemPrompt = promptTemplate
      .replace("{weeks}", JSON.stringify(weeks))
      .replace("{experienceLevel}", prompt.experienceLevel)
      .replace("{raceType}", prompt.raceType)
      .replace("{raceDistance}", prompt.raceDistance)
      .replace("{goalTime}", prompt.goalTime || "Not specified")
      .replace("{additionalNotes}", prompt.additionalNotes || "None");

    const { object } = await generateObject({
      model: client,
      prompt: systemPrompt,
      schema: workoutSkeletonSchema,
    });
    console.log("✅ Generated skeleton structure");

    return object;
  } catch (error) {
    throw error;
  }
}

export async function generateWeeklyOutline(
  formData: GeneratedWeekOutlinePrompt,
  model: SDKModel
) {
  const client = createSDKClient(model);
  try {
    console.log(`🤖 Generating week outline for ${formData.startDate}...`);
    const promptTemplate = await fs.readFile(
      path.join(process.cwd(), "prompts", "week-outline", "v0.0.1.txt"),
      "utf-8"
    );

    const systemPrompt = promptTemplate
      .replace("{daySlots}", JSON.stringify(getDaySlots(formData.startDate)))
      .replace("{overallDescription}", formData.overallDescription)
      .replace("{phaseObjective}", formData.phaseObjective)
      .replace("{phaseDescription}", formData.phaseDescription)
      .replace("{startDate}", formData.startDate)
      .replace("{endDate}", formData.endDate)
      .replace("{focus}", formData.focus)
      .replace(
        "{volumeDistance}",
        `${formData.volumeDistance.value} ${formData.volumeDistance.unit}`
      )
      .replace("{volumeDuration}", `${formData.volumeDuration.minutes} minutes`)
      .replace("{raceType}", formData.raceType)
      .replace("{goalTime}", formData.goalTime || "Not specified")
      .replace("{additionalNotes}", formData.additionalNotes || "None")
      .replace("{experienceLevel}", formData.experienceLevel)
      .replace("{restDay}", JSON.stringify(formData.restDay));
    const { object } = await generateObject({
      model: client,
      prompt: systemPrompt,
      schema: weekOutlineSchema,
    });

    console.log("✅ Generated week outline");
    return object;
  } catch (error) {
    throw error;
  }
}

export async function generateWorkout(prompt: string, model: SDKModel) {
  try {
    console.log("🤖 Generating individual workout...");
    const systemPrompt = await fs.readFile(
      path.join(process.cwd(), "prompts", "workout", "v0.0.2.txt"),
      "utf-8"
    );

    const augmentedPrompt = systemPrompt.replace("{userPrompt}", prompt);

    const client = createSDKClient(model);

    const { object } = await generateObject({
      model: client,
      prompt: augmentedPrompt,
      schema: workoutSchema,
    });

    console.log("✅ Generated workout");
    return object;
  } catch (error) {
    console.error("Error generating workout:", error);
    throw error;
  }
}

export async function generateTrainingPlan(
  prompt: WorkoutScheduleFormData,
  modelSelection?: ModelSelection
) {
  try {
    // Step 1: Generate the overall skeleton
    const skeleton = await generateSkeleton(
      prompt,
      modelSelection?.skeletonModel as SDKModel
    ).catch((error) => {
      console.error("Error generating skeleton:", error);
      return null;
    });

    if (!skeleton) {
      return null;
    }

    // Step 2: Generate week outlines and workouts
    const augmentedSkeleton = {
      ...skeleton,
      schedule: {
        ...skeleton.schedule,
        phases: await Promise.all(
          skeleton.schedule.phases.map(async (phase) => ({
            ...phase,
            weeks: await Promise.all(
              phase.weeks.map(async (week) => {
                const weekPrompt: GeneratedWeekOutlinePrompt = {
                  overallDescription: skeleton.schedule.description,
                  additionalNotes: prompt.additionalNotes,
                  raceType: prompt.raceType,
                  goalTime: prompt.goalTime,
                  experienceLevel: prompt.experienceLevel,
                  restDay: prompt.restDay,
                  phaseObjective: phase.objective,
                  focus: week.focus,
                  weekFocus: week.focus,
                  weekDescription: week.description,
                  startDate: new Date(week.startDate)
                    .toISOString()
                    .split("T")[0],
                  endDate: new Date(week.endDate).toISOString().split("T")[0],
                  phaseDescription: phase.description,
                  volumeDistance: week.volumeDistance,
                  volumeDuration: week.volumeDuration,
                };

                // Generate the week outline
                const weekOutline = await generateWeeklyOutline(
                  weekPrompt,
                  modelSelection?.weekOutlineModel as SDKModel
                ).catch((error) => {
                  console.error(
                    `Error generating week outline for ${week.startDate}:`,
                    error
                  );
                  return null;
                });

                if (!weekOutline) {
                  return {
                    ...week,
                    description: "Failed to generate week outline",
                    days: [],
                  };
                }

                // Generate workouts for each day
                const workouts = await Promise.all(
                  weekOutline.days.map(async (day) => {
                    if (day.isRestDay) {
                      return {
                        outline: day,
                        workout: null,
                      };
                    }

                    const workoutPrompt = {
                      weekDescription: weekOutline.detailedDescription,
                      dayDescription: day.dayDescription,
                      workoutType: prompt.raceType,
                      intensityLevel: day.intensityLevel,
                      date: day.date,
                      dayNumber: day.dayNumber,
                      dayName: day.dayName,
                      experienceLevel: prompt.experienceLevel,
                      raceType: prompt.raceType,
                      goalTime: prompt.goalTime,
                      additionalNotes: prompt.additionalNotes,
                    };

                    const workout = await generateWorkout(
                      JSON.stringify(workoutPrompt),
                      modelSelection?.workoutModel as SDKModel
                    ).catch((error) => {
                      console.error(
                        `Error generating workout for ${day.date}:`,
                        error
                      );
                      return null;
                    });

                    return {
                      outline: day,
                      workout: workout, // Will be null if generation failed
                    };
                  })
                );

                return {
                  ...week,
                  description: weekOutline.detailedDescription,
                  days: workouts,
                };
              })
            ),
          }))
        ),
      },
    };

    return augmentedSkeleton;
  } catch (error) {
    console.error("Error in generateTrainingPlan:", error);
    return null;
  }
}
