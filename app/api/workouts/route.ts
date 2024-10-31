import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@lib/prisma";
import { CreateWorkoutInput } from "@/schemas/workout-schema";
import { getOrCreateUser } from "@/app/actions/user";
import { createWorkout } from "@/app/actions/workout";

// GET WORKOUTS /workouts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type") as "authored" | "favorited" | null;
    const { userId } = auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const skip = (page - 1) * limit;
    let where: any = {};
    if (type === "authored") {
      where.authorId = parseInt(userId);
    } else if (type === "favorited") {
      where.favoritedBy = { some: { clerkId: userId } };
    }

    const [workouts, total] = await Promise.all([
      prisma.workout.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: {
            include: {
              repeatGroup: {
                include: {
                  intervals: true,
                },
              },
              interval: true,
            },
          },
          author: true,
          favoritedBy: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.workout.count({ where }),
    ]);

    const formattedWorkouts = workouts.map((workout) => ({
      ...workout,
      isFavorited:
        Array.isArray(workout.favoritedBy) &&
        workout.favoritedBy.some((user) => user.clerkId === userId),
      favoritedBy: undefined,
    }));

    return NextResponse.json({
      workouts: formattedWorkouts,
      total,
      page,
      limit,
      hasMore: skip + workouts.length < total,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// CREATE A WORKOUT / workouts
export async function POST(request: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await getOrCreateUser(clerkUser.id, {
      username: clerkUser.username,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      email: clerkUser.emailAddresses[0]?.emailAddress,
    });

    const data: CreateWorkoutInput = await request.json();

    const { title, description, type, items } = data;

    const workout = await createWorkout(
      user.id,
      title,
      description,
      type,
      items
    );
    return NextResponse.json(workout);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
