// pages/api/generateWorkout.ts

import OpenAI from "openai";
import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { zodResponseFormat } from "openai/helpers/zod";

import {
  IntervalType,
  WorkoutType,
  DurationType,
  IntensityType,
} from "@/types/workouts";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define Zod schemas for enums
const IntervalTypeSchema = z.enum(
  Object.values(IntervalType) as [IntervalType, ...IntervalType[]]
);
const WorkoutTypeSchema = z.enum(
  Object.values(WorkoutType) as [WorkoutType, ...WorkoutType[]]
);
const DurationTypeSchema = z.enum(
  Object.values(DurationType) as [DurationType, ...DurationType[]]
);
const IntensityTypeSchema = z.enum(
  Object.values(IntensityType) as [IntensityType, ...IntensityType[]]
);

const singleIntervalSchema = z.object({
  type: IntervalTypeSchema,
  durationType: DurationTypeSchema,
  durationValue: z.number(),
  durationUnit: z.string(),
  intensityType: IntensityTypeSchema,
  intensityMin: z.string(),
  intensityMax: z.string(),
});

const intervalSchema = z.object({
  id: z.number().int(),
  order: z.number().int(),
  interval: singleIntervalSchema,
});

const repeatGroupSchema = z.object({
  id: z.number().int(),
  order: z.number().int(),
  repeatGroup: z.object({
    intervals: z.array(singleIntervalSchema),
    repeats: z.number().int(),
  }),
});

const workoutSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: WorkoutTypeSchema,
  items: z.union([intervalSchema, repeatGroupSchema]),
});

const workoutJsonSchema = zodToJsonSchema(workoutSchema, "workoutSchema");

const workoutParameters = workoutJsonSchema?.definitions?.workoutSchema;

const generateWorkoutFunction = {
  name: "generate_workout",
  description: "Generates a workout plan based on the user prompt.",
  parameters: workoutParameters,
};

export async function POST(req: Request, res: NextResponse) {
  const { prompt } = await req.json();

  try {
    const systemPrompt = `
      You are a seasoned endurance coach with significant experience in running, biking, swimming, and triathlon. Generate a workout based on the user's prompt, and output it in the following JSON schema without deviation.
      Please use the RepeatGroup resource in favor of listing intervals when building a workout that has repeated intervals.  Pay close attention to the type of workous one is initially requesting, and pick between the types of available workouts in the Workout type enum.
      You should also give a detailed description of the workout, and include detials on how the user should prepare for the workokut mentally and physically.  You should also include how to best execute the workout.  Include additional information regarding form and fueling techniques
      `;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_NAME || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      functions: [generateWorkoutFunction],
      function_call: { name: "generate_workout" },
      response_format: zodResponseFormat(workoutSchema, "workoutSchema"),
    });

    const message = completion?.choices[0]?.message;

    if (message?.function_call?.arguments) {
      const workout = JSON.parse(message.function_call.arguments);
      const validatedWorkout = workoutSchema.parse(workout);
      return NextResponse.json({ workout: validatedWorkout });
    } else {
      return NextResponse.json({ error: "Failed to generate workout" });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: "Validation failed",
        details: error.errors,
      });
    } else if (error instanceof SyntaxError) {
      return NextResponse.json({
        error: "Invalid JSON in workout generation",
      });
    } else {
      return NextResponse.json({
        error: "An error occurred while generating the workout plan.",
      });
    }
  }
}
