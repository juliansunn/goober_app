import { openAIGPT40MiniSDKModel } from "@/config/ai-models";
import { generateWeeklyOutline } from "@/functions/generateTrainingPlan";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const modelSelection = openAIGPT40MiniSDKModel;
    const outline = await generateWeeklyOutline(prompt, modelSelection);
    return NextResponse.json(outline);
  } catch (error) {
    console.error("Error generating week outline:", error);
    return NextResponse.json(
      { error: "Failed to generate week outline" },
      { status: 500 }
    );
  }
}
