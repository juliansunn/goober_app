"use client";

import DragAndDrop from "@/components/test/test-dnd";
import { WorkoutBuilder } from "@/components/workout-builder";

export default function DashboardPage() {
  const items = [
    { id: 1, name: "Card 1" },
    { id: 2, name: "Card 2" },
    { id: 3, name: "Card 3" },
  ];

  return (
    <div>
      <DragAndDrop itemArray={items} />
    </div>
  );
}
