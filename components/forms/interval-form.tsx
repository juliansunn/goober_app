import {
  Duration,
  DurationType,
  IntensityTarget,
  IntensityType,
  Interval,
  IntervalType,
} from "@/types/workouts";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { X } from "lucide-react";

const DurationSelector = ({
  duration,
  onChange,
}: {
  duration: Duration;
  onChange: (duration: Duration) => void;
}) => (
  <div className="grid gap-2">
    <Label>Duration Type</Label>
    <Select
      value={duration.type}
      onValueChange={(value: DurationType) =>
        onChange({ ...duration, type: value })
      }
    >
      <SelectTrigger className="bg-white">
        <SelectValue placeholder="Select duration type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={DurationType.TIME}>Time</SelectItem>
        <SelectItem value={DurationType.DISTANCE}>Distance</SelectItem>
        <SelectItem value={DurationType.HEART_RATE}>Heart Rate</SelectItem>
        <SelectItem value={DurationType.CALORIES}>Calories</SelectItem>
      </SelectContent>
    </Select>
    <div className="flex gap-2">
      <Input
        type="number"
        value={duration.value}
        onChange={(e) =>
          onChange({ ...duration, value: Number(e.target.value) })
        }
        className="flex-grow bg-white"
      />
      <Select
        value={duration.unit}
        onValueChange={(value: string) =>
          onChange({ ...duration, unit: value })
        }
      >
        <SelectTrigger className="w-[100px] bg-white">
          <SelectValue placeholder="Unit" />
        </SelectTrigger>
        <SelectContent>
          {duration.type === DurationType.TIME && (
            <>
              <SelectItem value="seconds">Seconds</SelectItem>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
            </>
          )}
          {duration.type === DurationType.DISTANCE && (
            <>
              <SelectItem value="meters">Meters</SelectItem>
              <SelectItem value="kilometers">Kilometers</SelectItem>
              <SelectItem value="miles">Miles</SelectItem>
            </>
          )}
          {duration.type === DurationType.HEART_RATE && (
            <SelectItem value="bpm">BPM</SelectItem>
          )}
          {duration.type === DurationType.CALORIES && (
            <SelectItem value="calories">Calories</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  </div>
);

const IntensityTargetSelector = ({
  intensityTarget,
  onChange,
}: {
  intensityTarget: IntensityTarget;
  onChange: (intensityTarget: IntensityTarget) => void;
}) => {
  const isPaceType = [
    IntensityType.PACE_MILE,
    IntensityType.PACE_KM,
    IntensityType.PACE_400M,
  ].includes(intensityTarget.type);
  const unit =
    intensityTarget.type === IntensityType.CADENCE
      ? "rpm"
      : intensityTarget.type === IntensityType.HEART_RATE
      ? "bpm"
      : intensityTarget.type === IntensityType.POWER
      ? "watts"
      : intensityTarget.type === IntensityType.PACE_MILE
      ? "min/mile"
      : intensityTarget.type === IntensityType.PACE_KM
      ? "min/km"
      : intensityTarget.type === IntensityType.PACE_400M
      ? "sec/400m"
      : "";

  return (
    <div className="grid gap-2">
      <Label>Intensity Target</Label>
      <Select
        value={intensityTarget.type}
        onValueChange={(value: IntensityType) =>
          onChange({ ...intensityTarget, type: value, min: "", max: "" })
        }
      >
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="Select intensity type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={IntensityType.NONE}>None</SelectItem>
          <SelectItem value={IntensityType.CADENCE}>Cadence</SelectItem>
          <SelectItem value={IntensityType.HEART_RATE}>Heart Rate</SelectItem>
          <SelectItem value={IntensityType.POWER}>Power</SelectItem>
          <SelectItem value={IntensityType.PACE_MILE}>
            Pace (min/mile)
          </SelectItem>
          <SelectItem value={IntensityType.PACE_KM}>Pace (min/km)</SelectItem>
          <SelectItem value={IntensityType.PACE_400M}>
            Pace (sec/400m)
          </SelectItem>
        </SelectContent>
      </Select>
      {intensityTarget.type !== IntensityType.NONE && (
        <div className="flex gap-2 items-center">
          <Input
            type={isPaceType ? "text" : "number"}
            value={intensityTarget.min}
            onChange={(e) =>
              onChange({ ...intensityTarget, min: e.target.value })
            }
            placeholder="Min"
            className="bg-white"
          />
          <span>to</span>
          <Input
            type={isPaceType ? "text" : "number"}
            value={intensityTarget.max}
            onChange={(e) =>
              onChange({ ...intensityTarget, max: e.target.value })
            }
            placeholder="Max"
            className="bg-white"
          />
          <span>{unit}</span>
        </div>
      )}
    </div>
  );
};

const IntervalForm = ({
  interval,
  onChange,
  onRemove,
}: {
  interval: Interval;
  onChange: (interval: Interval) => void;
  onRemove?: () => void;
}) => (
  <div className="grid gap-4">
    <div className="flex justify-between items-center">
      <Label htmlFor="intervalType">Interval Type</Label>
      {onRemove && (
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
    <Select
      value={interval.type}
      onValueChange={(value: IntervalType) =>
        onChange({ ...interval, type: value })
      }
    >
      <SelectTrigger id="intervalType">
        <SelectValue placeholder="Select interval type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={IntervalType.WARMUP}>Warm-up</SelectItem>
        <SelectItem value={IntervalType.ACTIVE}>Active</SelectItem>
        <SelectItem value={IntervalType.COOLDOWN}>Cool-down</SelectItem>
        <SelectItem value={IntervalType.REST}>Rest</SelectItem>
      </SelectContent>
    </Select>
    <DurationSelector
      duration={interval.duration}
      onChange={(duration) => onChange({ ...interval, duration })}
    />
    <IntensityTargetSelector
      intensityTarget={interval.intensityTarget}
      onChange={(intensityTarget) => onChange({ ...interval, intensityTarget })}
    />
  </div>
);

export default IntervalForm;
