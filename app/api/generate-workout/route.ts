// pages/api/generateWorkout.ts

import OpenAI from "openai";
import { NextResponse } from "next/server";
import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { zodResponseFormat } from "openai/helpers/zod";
import { workoutSchema } from "@/types/schedule";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
      Please use the RepeatGroup resource in favor of listing intervals when building a workout that has repeated intervals.  Pay close attention to the type of workouts one is initially requesting, and pick between the types of available workouts in the Workout type enum.
      You should also give a detailed description of the workout, and include detials on how the user should prepare for the workout mentally and physically.  You should also include how to best execute the workout.  Include additional information regarding form and fueling techniques.  This field is a markdown field, so use it to your advantage to format your response.
      Only return one workout.  Do not return multiple workouts.
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
    const workout = JSON.parse(message?.function_call?.arguments || "{}");

    const validatedWorkout = workoutSchema.parse(workout);
    return NextResponse.json({ workout: validatedWorkout });
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
        details: error.message,
      });
    } else {
      return NextResponse.json({
        error: "An error occurred while generating the workout plan.",
        details: error,
      });
    }
  }
}
