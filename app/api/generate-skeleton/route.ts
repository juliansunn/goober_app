import { openAIGPT40MiniSDKModel } from "@/config/ai-models";
import { generateSkeleton } from "@/functions/generateTrainingPlan";
import { WorkoutScheduleFormData } from "@/types/workout";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const parsedPrompt = JSON.parse(prompt) as WorkoutScheduleFormData;
    const modelSelection = openAIGPT40MiniSDKModel;
    const skeleton = await generateSkeleton(parsedPrompt, modelSelection);
    return NextResponse.json(skeleton);
  } catch (error) {
    console.error("Error generating skeleton:", error);
    return NextResponse.json(
      { error: "Failed to generate skeleton" },
      { status: 500 }
    );
  }
}
