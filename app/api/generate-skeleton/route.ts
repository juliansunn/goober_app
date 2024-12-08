import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { workoutSkeletonSchema } from "@/schemas/skeleton";
import { zodResponseFormat } from "openai/helpers/zod.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_TOKENS = 6000;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const parsedPrompt = JSON.parse(prompt);

    const systemPrompt = `You are an experienced endurance coach specializing in creating personalized training plans. Your task is to generate a high-level training plan skeleton in JSON format, based on the user's provided information. The plan should be tailored to their experience level, goals, and race details.

    Instructions:
    1. Create a training plan that starts from ${parsedPrompt.startDate} and ends on ${parsedPrompt.raceDate}.
    2. Divide the training period into appropriate phases (Base, Build, Peak, Taper).
    3. For each phase:
       - Define clear objectives
       - Break down into weeks
       - Specify weekly focus and intensity distribution
       - Create placeholder workouts (3-6 per week)
    4. Consider the user's:
       - Experience level: ${parsedPrompt.experienceLevel}
       - Race type: ${parsedPrompt.raceType}
       - Race distance: ${parsedPrompt.raceDistance}
       - Goal time: ${parsedPrompt.goalTime || "Not specified"}
    
    The schedule should follow proper periodization principles and gradually build intensity and volume appropriate to the user's level and goals.`;

    try {
      const completion = await openai.beta.chat.completions.parse({
        model: process.env.OPENAI_MODEL_NAME || "gpt-4o-mini",
        max_tokens: MAX_TOKENS,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(parsedPrompt) },
        ],
        response_format: zodResponseFormat(
          workoutSkeletonSchema,
          "workoutSkeletonSchema"
        ),
      });

      const message = completion.choices[0]?.message;
      if (!message || !message.content) {
        throw new Error("No response from OpenAI");
      }

      const parsedResponse = JSON.parse(message.content);
      const validatedResponse = workoutSkeletonSchema.parse(parsedResponse);

      return NextResponse.json(validatedResponse);
    } catch (error) {
      console.error("Schedule generation error:", error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.errors },
          { status: 400 }
        );
      } else if (error instanceof SyntaxError) {
        return NextResponse.json(
          {
            error: "Invalid JSON in workout schedule generation",
            details: error.message,
          },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          {
            error: "An error occurred while generating the workout plan.",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Schedule generation error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the request" },
      { status: 500 }
    );
  }
}
