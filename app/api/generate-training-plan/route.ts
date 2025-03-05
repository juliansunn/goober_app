import { deepseekChatSDKModel } from "@/config/ai-models";
import { generateTrainingPlan } from "@/functions/generateTrainingPlan";
import { WorkoutScheduleFormData } from "@/types/workout";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // prompt should be of type WorkoutScheduleFormData
    const parsedPrompt = JSON.parse(prompt) as WorkoutScheduleFormData;

    const modelSelection = {
      skeletonModel: deepseekChatSDKModel,
      weekOutlineModel: deepseekChatSDKModel,
      workoutModel: deepseekChatSDKModel,
    };

    // Generate the full training plan
    const trainingPlan = await generateTrainingPlan(
      parsedPrompt,
      modelSelection
    );

    // Return the complete training plan
    return NextResponse.json({
      success: true,
      data: trainingPlan,
    });
  } catch (error) {
    console.error("Training plan generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
