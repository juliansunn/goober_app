import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, X, ChevronUp, ChevronDown } from "lucide-react";
import { Interval, IntervalType, RepeatGroup } from "@/types/workouts";
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
  const intervalType = isRepeatGroup ? IntervalType.ACTIVE : item.type;
  const dragControls = useDragControls();

  return (
    <Card
      className={`${getIntervalColor(
        intervalType,
        isRepeatGroup
      )} ${getIntervalTextColor(intervalType)} ${
        isRepeatGroup ? "border-2 border-purple-300 rounded-lg" : "rounded-lg"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center">
          <div className="flex flex-col mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={moveUp}
              disabled={isFirst}
              className="p-0 h-4"
            >
              <ChevronUp
                className={`h-3 w-3 ${
                  isFirst
                    ? "text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={moveDown}
              disabled={isLast}
              className="p-0 h-4"
            >
              <ChevronDown
                className={`h-3 w-3 ${
                  isLast ? "text-gray-300" : "text-gray-500 hover:text-gray-700"
                }`}
              />
            </Button>
          </div>
          <CardTitle className="text-sm font-medium">
            {isRepeatGroup
              ? `Repeat Group (${item.repeats}x)`
              : `${
                  item.type.charAt(0).toUpperCase() + item.type.slice(1)
                } Interval`}
          </CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editInterval(item)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeInterval(item.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>{/* ... existing content ... */}</CardContent>
    </Card>
  );
};

export default IntervalItem;
