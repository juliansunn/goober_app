"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Edit2,
  X,
  ChevronUp,
  ChevronDown,
  Clock,
  Activity,
  RotateCcw,
} from "lucide-react";
import {
  IntensityType,
  Interval,
  IntervalType,
  RepeatGroup,
} from "@/types/workouts";
import { useDragControls } from "framer-motion";
import { getIntervalColor, getIntervalTextColor } from "@/lib/workout-utils";

interface IntervalItemProps {
  item: Interval | RepeatGroup;
  removeInterval: (id: number) => void;
  editInterval: (item: Interval | RepeatGroup) => void;
  moveUp: () => void;
  moveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const IntervalItem: React.FC<IntervalItemProps> = ({
  item,
  removeInterval,
  editInterval,
  moveUp,
  moveDown,
  isFirst,
  isLast,
}) => {
  const isRepeatGroup = "intervals" in item;

  const dragControls = useDragControls();

  const capitalize = (str: string) =>
    str?.charAt(0).toUpperCase() + str?.slice(1);

  const renderIntervalDetails = (interval: Interval) => (
    <div className="flex items-center space-x-2 text-sm opacity-80">
      <Clock className="w-4 h-4" />
      <span>
        {interval.durationValue} {interval.durationUnit}
      </span>
      {interval.intensityType !== IntensityType.NONE && (
        <>
          <span>•</span>
          <span>
            {interval.intensityType}{" "}
            {interval.intensityMin &&
              `${interval.intensityMin}-${interval.intensityMax}`}
          </span>
        </>
      )}
    </div>
  );

  return (
    <Card
      className={`${
        isRepeatGroup
          ? "bg-purple-200 dark:bg-purple-800"
          : getIntervalColor(item.type)
      } ${
        isRepeatGroup
          ? "text-purple-800 dark:text-purple-200"
          : getIntervalTextColor(item.type)
      } p-4 relative`}
    >
      <CardContent className="flex flex-col p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isRepeatGroup ? (
              <RotateCcw className="w-6 h-6" />
            ) : (
              <Activity className="w-6 h-6" />
            )}
            <div>
              <h3 className="font-semibold text-lg">
                {isRepeatGroup
                  ? `Repeat ${(item as RepeatGroup).repeats}x`
                  : capitalize(item?.type)}
              </h3>
              {isRepeatGroup ? (
                <p className="text-sm opacity-80">
                  {item.repeats}x {item.intervals.length} intervals
                </p>
              ) : (
                renderIntervalDetails(item as Interval)
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {!isFirst && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={moveUp}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
            {!isLast && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={moveDown}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => editInterval(item)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeInterval(item.id!)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {isRepeatGroup && (
          <div className="mt-2 space-y-2">
            {(item as RepeatGroup).intervals.map((interval, index) => (
              <div
                key={index}
                className="pl-4 border-l-2 border-purple-400 dark:border-purple-600"
              >
                <p className="font-medium">
                  {capitalize(interval?.type || "Repeat")}
                </p>
                {renderIntervalDetails(interval)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntervalItem;
