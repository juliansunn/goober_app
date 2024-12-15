import { promises as fs } from "fs";
import path from "path";

import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { scheduledWorkoutSchema } from "@/schemas/schedule";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { replaceKeys } from "@/lib/workout-utils";

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const scheduledWorkoutsSchema = z.object({
  scheduledWorkouts: z.array(scheduledWorkoutSchema),
});

const MAX_TOKENS = 6000;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    // Add error handling for missing prompt
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const parsedPrompt = JSON.parse(prompt);

    // Load system prompt from file
    const promptPath = path.join(
      process.cwd(),
      "prompts",
      "schedule",
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

    const formattedSystemPrompt = systemPrompt
      .replace("{startDate}", parsedPrompt.startDate)
      .replace("{startDate}", parsedPrompt.raceDate);

    try {
      const completion = await openaiClient.beta.chat.completions.parse({
        model: process.env.OPENAI_MODEL_NAME || "gpt-4o-mini",
        max_tokens: MAX_TOKENS,
        messages: [
          { role: "system", content: formattedSystemPrompt },
          { role: "user", content: JSON.stringify(parsedPrompt) },
        ],
        response_format: zodResponseFormat(
          scheduledWorkoutsSchema,
          "scheduledWorkoutsSchema"
        ),
      });

      const message = completion.choices[0]?.message;
      if (!message || !message.content) {
        throw new Error("No response from OpenAI");
      }

      // Parse and validate the response
      const parsedResponse = JSON.parse(message.content);
      const validatedResponse = scheduledWorkoutsSchema.parse(parsedResponse);
      const renamedParsed = replaceKeys(validatedResponse);

      return NextResponse.json(renamedParsed);
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
    // Make sure to return a response
    return NextResponse.json(
      { error: "An error occurred while generating the schedule" },
      { status: 500 }
    );
  }
}
