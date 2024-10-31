import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getStravaAccessToken } from "@/functions/strava";
import { getOrCreateUser } from "@/app/actions/user";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const user = await getOrCreateUser(clerkUser.id, {
      username: clerkUser.username,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      email: clerkUser.emailAddresses[0]?.emailAddress,
    });
    const accessToken = await getStravaAccessToken();

    const response = await fetch(`https://www.strava.com/api/v3/athlete`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Strava API error: ${response.statusText}`);
    }

    const athleteData = await response.json();

    return NextResponse.json(athleteData);
  } catch (error) {
    console.error("Error fetching Strava athlete data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
