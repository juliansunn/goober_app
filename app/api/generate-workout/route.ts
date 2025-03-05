// pages/api/generateWorkout.ts

import { NextResponse } from "next/server";

import { generateWorkout } from "@/functions/generateTrainingPlan";

import { deepseekChatSDKModel } from "@/config/ai-models";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const workout = await generateWorkout(prompt, deepseekChatSDKModel);
    return NextResponse.json(workout);
  } catch (error) {
    console.error("Error generating workout:", error);
    return NextResponse.json(
      {
        error: "Failed to generate workout",
        details: JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}
