import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@lib/prisma";
import { CreateWorkoutInput } from "@/schemas/workout-schema";
import { Prisma, WorkoutType } from "@prisma/client";

async function getOrCreateUser(clerkId: string, userInfo: any) {
  return await prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: {
      clerkId,
      username: userInfo.username,
      name: userInfo.name,
      email: userInfo.email,
    },
  });
}

// Helper function to create an interval
function createIntervalData(interval: any) {
  return {
    type: interval.type,
    durationType: interval.durationType,
    durationValue: interval.durationValue,
    durationUnit: interval.durationUnit,
    intensityType: interval.intensityType,
    intensityMin: interval.intensityMin,
    intensityMax: interval.intensityMax,
  };
}

// Helper function to create a repeat group
function createRepeatGroupData(repeatGroup: any) {
  return {
    repeats: repeatGroup.repeats,
    intervals: {
      create: repeatGroup.intervals.map(createIntervalData),
    },
  };
}

// Helper function to create workout items
function createWorkoutItemsData(
  items: any[]
): Prisma.WorkoutItemCreateWithoutWorkoutInput[] {
  return items.map((item, index) => ({
    order: index + 1,
    repeatGroup: item.repeatGroup
      ? {
          create: createRepeatGroupData(item.repeatGroup),
        }
      : undefined,
    interval: item.interval
      ? { create: createIntervalData(item.interval) }
      : undefined,
  }));
}

// Helper function to create the workout
async function createWorkout(
  userId: number,
  title: string,
  description: string,
  type: WorkoutType,
  items: any[]
): Promise<
  Prisma.WorkoutGetPayload<{
    include: {
      author: true;
      items: {
        include: {
          interval: true;
          repeatGroup: {
            include: {
              intervals: true;
            };
          };
        };
      };
    };
  }>
> {
  return await prisma.workout.create({
    data: {
      title,
      description,
      type: type,
      author: { connect: { id: userId } },
      items: { create: createWorkoutItemsData(items) }, // Use the helper function here
    },
    include: {
      author: true,
      items: {
        include: {
          interval: true,
          repeatGroup: {
            include: {
              intervals: true,
            },
          },
        },
      },
    },
  });
}

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
