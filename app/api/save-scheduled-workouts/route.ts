import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/app/actions/user";
import { createScheduleWorkouts } from "@/app/actions/workout";

export async function POST(req: Request) {
  try {
    const { workouts } = await req.json();

    // Validate the workouts array
    if (!Array.isArray(workouts) || workouts.length === 0) {
      return NextResponse.json(
        { error: "Invalid workouts data" },
        { status: 400 }
      );
    }

    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await getOrCreateUser(userId, {});

    // Save the workouts to the database
    const savedWorkouts = await createScheduleWorkouts(user.id, workouts);

    return NextResponse.json({
      message: "Workouts saved successfully",
      count: savedWorkouts.length,
    });
  } catch (error) {
    console.error("Error saving scheduled workouts:", error);
    return NextResponse.json(
      { error: "An error occurred while saving the workouts" },
      { status: 500 }
    );
  }
}
