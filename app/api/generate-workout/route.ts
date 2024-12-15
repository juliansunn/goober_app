// pages/api/generateWorkout.ts

import OpenAI from "openai";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";

import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { zodResponseFormat } from "openai/helpers/zod";
import { workoutSchema } from "@/schemas/schedule";
import path from "path";
import { replaceKeys } from "@/lib/workout-utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const completion = await openai.beta.chat.completions.parse({
      model: process.env.OPENAI_MODEL_NAME || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: zodResponseFormat(workoutSchema, "workoutSchema"),
    });

    const message = completion.choices[0]?.message;
    if (!message || !message.content) {
      throw new Error("No response from OpenAI");
    }

    // Parse and validate the response
    const validatedWorkout = JSON.parse(message.content);
    const renamedParsed = replaceKeys(validatedWorkout);

    return NextResponse.json({ workout: renamedParsed });
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
