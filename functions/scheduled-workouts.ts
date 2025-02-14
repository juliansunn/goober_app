export async function getScheduledWorkoutsList(params: {
  startDate: Date;
  endDate: Date;
}) {
  const searchParams = new URLSearchParams({
    startDate: params.startDate.toISOString(),
    endDate: params.endDate.toISOString(),
  });

  const response = await fetch(
    `/api/scheduled-workouts?${searchParams.toString()}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch scheduled workouts");
  }

  return response.json();
}
