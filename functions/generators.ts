export async function generateWorkout(prompt: string) {
  try {
    const response = await fetch("/api/generate-workout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.workout;
  } catch (error) {
    console.error("Error generating workout:", error);
    throw error;
  }
}
