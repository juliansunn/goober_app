// pages/api/generateWorkout.ts

import OpenAI from "openai";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";

import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { zodResponseFormat } from "openai/helpers/zod";
import { workoutSchema } from "@/schemas/schedule";
import path from "path";

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
    const promptPath = path.join(
      process.cwd(),
      "prompts",
      "workout",
      "v0.0.1.txt"
    );

    // Add error handling for file reading
    let systemPrompt;
    try {
      systemPrompt = await fs.readFile(promptPath, "utf8");
    } catch (error) {
      console.error("Error reading prompt file:", error);
      return NextResponse.json(
        { error: "Failed to load system prompt" },
        { status: 500 }
      );
    }

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
