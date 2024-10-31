import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { scheduledWorkoutSchema } from "@/types/schedule";
import { zodResponseFormat } from "openai/helpers/zod.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const scheduledWorkoutsSchema = z.object({
  scheduledWorkouts: z.array(scheduledWorkoutSchema),
});

const scheduledWorkoutsJsonSchema = zodToJsonSchema(
  scheduledWorkoutsSchema,
  "scheduledWorkoutsSchema"
);

const scheduledWorkoutParameters =
  scheduledWorkoutsJsonSchema?.definitions?.scheduledWorkoutsSchema;

const generateScheduledWorkoutFunction = {
  name: "generate_scheduled_workout",
  description: "Generates a scheduled workout plan based on the user's input.",
  parameters: scheduledWorkoutParameters,
};

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const parsedPrompt = JSON.parse(prompt);

  const systemPrompt = `You are an experienced endurance coach specializing in creating personalized workout schedules. Your task is to generate a detailed and structured workout plan in JSON format, based on the user's provided information. The plan should be tailored to their experience level, goals, and race details.
    Instructions:  
    Create a workout schedule that starts from the given start date: ${parsedPrompt.startDate} and ends on the specified race date: ${parsedPrompt.raceDate}.
    The schedule should include between 3-10 workouts per week, incorporating appropriate rest days as specified by the user.
    Tailor each workout to help the user achieve their goal race pace and finish time for the given distance, based on the provided experience level and any additional notes.  Do not include any rest days in the schedule.
    Each workout should be designed using the provided workout schema, with the necessary details, including warmups, cooldowns, intensity, distance, time, and type of workout (e.g., interval, tempo, long run).`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_NAME || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(parsedPrompt) },
      ],
      functions: [generateScheduledWorkoutFunction],
      function_call: { name: "generate_scheduled_workout" },
      response_format: zodResponseFormat(
        scheduledWorkoutsSchema,
        "scheduledWorkoutsSchema"
      ),
    });

    const message = completion?.choices[0]?.message;

    if (message?.function_call?.arguments) {
      const parsedScheduledWorkouts = JSON.parse(
        message.function_call.arguments
      );
      const validatedScheduledWorkouts = scheduledWorkoutsSchema.parse(
        parsedScheduledWorkouts
      );
      return NextResponse.json(validatedScheduledWorkouts);
    } else {
      return NextResponse.json({
        error: "Failed to generate workout schedule",
      });
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
        error: "Invalid JSON in workout schedule generation",
      });
    } else {
      return NextResponse.json({
        error: "An error occurred while generating the workout plan.",
      });
    }
  }
}
