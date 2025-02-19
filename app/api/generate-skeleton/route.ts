import { workoutSkeletonSchema } from "@/schemas/skeleton";
import { generateWeekDatesFromStartAndEndDate } from "@/utils/date-utils";
import fs from "fs/promises";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import path from "path";
import { z } from "zod";
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

    const promptTemplate = await fs.readFile(
      path.join(process.cwd(), "prompts", "skeleton", "v0.0.1.txt"),
      "utf-8"
    );

    const weeks = generateWeekDatesFromStartAndEndDate(
      parsedPrompt.startDate,
      parsedPrompt.raceDate
    );

    const systemPrompt = promptTemplate
      .replace("{weeks}", JSON.stringify(weeks))
      .replace("{experienceLevel}", parsedPrompt.experienceLevel)
      .replace("{raceType}", parsedPrompt.raceType)
      .replace("{raceDistance}", parsedPrompt.raceDistance)
      .replace("{goalTime}", parsedPrompt.goalTime || "Not specified")
      .replace("{additionalNotes}", parsedPrompt.additionalNotes || "None");

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
