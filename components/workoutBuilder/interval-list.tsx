"use client";

import { Reorder } from "framer-motion";
import { WorkoutItem } from "@/types/workouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IntervalItem from "./interval-item";

interface IntervalListProps {
  items: WorkoutItem[];
  onReorder: (newOrder: WorkoutItem[]) => void;
  onRemoveInterval: (id: number) => void;
  onEditInterval: (item: WorkoutItem) => void;
  onMoveInterval: (id: number, direction: "up" | "down") => void;
}

export function IntervalList({
  items,
  onReorder,
  onRemoveInterval,
  onEditInterval,
  onMoveInterval,
}: IntervalListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Intervals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Reorder.Group axis="y" values={items} onReorder={onReorder}>
          <div className="grid gap-2">
            {items.map((item, index) => {
              const workoutItem = item.interval
                ? item.interval
                : item.repeatGroup;
              if (!workoutItem) return null;
              if (item.id === undefined) return null;

              return (
                <Reorder.Item key={item.id} value={item}>
                  <IntervalItem
                    item={workoutItem}
                    removeInterval={() => onRemoveInterval(item.id ?? 0)}
                    editInterval={() => onEditInterval(item)}
                    moveUp={() => onMoveInterval(item.id ?? 0, "up")}
                    moveDown={() => onMoveInterval(item.id ?? 0, "down")}
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                  />
                </Reorder.Item>
              );
            })}
          </div>
        </Reorder.Group>
      </CardContent>
    </Card>
  );
}
