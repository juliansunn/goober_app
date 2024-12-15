import {
  DurationType,
  DurationUnit,
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
  durationType,
  durationValue,
  durationUnit,
  onChange,
}: {
  durationType: DurationType;
  durationValue: number;
  durationUnit: DurationUnit;
  onChange: (type: DurationType, value: number, unit: DurationUnit) => void;
}) => {
  return (
    <div className="grid gap-2">
      <Label>Duration Type</Label>
      <Select
        value={durationType}
        onValueChange={(value: DurationType) =>
          onChange(value, durationValue, durationUnit)
        }
      >
        <SelectTrigger>
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
          value={durationValue}
          onChange={(e) =>
            onChange(durationType, Number(e.target.value), durationUnit)
          }
          className="flex-grow"
        />
        <Select
          value={durationUnit}
          onValueChange={(value: DurationUnit) =>
            onChange(durationType, durationValue, value)
          }
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            {durationType === DurationType.TIME && (
              <>
                <SelectItem value="SECONDS">Seconds</SelectItem>
                <SelectItem value="MINUTES">Minutes</SelectItem>
                <SelectItem value="HOURS">Hours</SelectItem>
              </>
            )}
            {durationType === DurationType.DISTANCE && (
              <>
                <SelectItem value="METERS">Meters</SelectItem>
                <SelectItem value="KILOMETERS">Kilometers</SelectItem>
                <SelectItem value="MILES">Miles</SelectItem>
              </>
            )}
            {durationType === DurationType.HEART_RATE && (
              <SelectItem value="BPM">BPM</SelectItem>
            )}
            {durationType === DurationType.CALORIES && (
              <SelectItem value="CALORIES">Calories</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const IntensityTargetSelector = ({
  intensityType,
  intensityMin,
  intensityMax,
  onChange,
}: {
  intensityType: IntensityType;
  intensityMin: string;
  intensityMax: string;
  onChange: (type: IntensityType, min: string, max: string) => void;
}) => {
  const isPaceType = Object.values(IntensityType).includes(intensityType);
  const unit =
    intensityType === IntensityType.CADENCE
      ? "rpm"
      : intensityType === IntensityType.HEART_RATE
        ? "bpm"
        : intensityType === IntensityType.POWER
          ? "watts"
          : intensityType === IntensityType.PACE_MILE
            ? "min/mile"
            : intensityType === IntensityType.PACE_KM
              ? "min/km"
              : intensityType === IntensityType.PACE_400M
                ? "sec/400m"
                : "";

  return (
    <div className="grid gap-2">
      <Label>Intensity Target</Label>
      <Select
        value={intensityType}
        onValueChange={(value: IntensityType) => onChange(value, "", "")}
      >
        <SelectTrigger>
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
      {intensityType !== IntensityType.NONE && (
        <div className="flex gap-2 items-center">
          <Input
            type={isPaceType ? "text" : "number"}
            value={intensityMin}
            onChange={(e) =>
              onChange(intensityType, e.target.value, intensityMax)
            }
            placeholder="Min"
          />
          <span>to</span>
          <Input
            type={isPaceType ? "text" : "number"}
            value={intensityMax}
            onChange={(e) =>
              onChange(intensityType, intensityMin, e.target.value)
            }
            placeholder="Max"
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
}) => {
  return (
    <div className="grid gap-4 p-4 rounded-lg">
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
        durationType={interval.durationType}
        durationValue={interval.durationValue}
        durationUnit={interval.durationUnit}
        onChange={(type, value, unit) =>
          onChange({
            ...interval,
            durationType: type,
            durationValue: value,
            durationUnit: unit,
          })
        }
      />
      <IntensityTargetSelector
        intensityType={interval.intensityType}
        intensityMin={interval.intensityMin}
        intensityMax={interval.intensityMax}
        onChange={(type, min, max) =>
          onChange({
            ...interval,
            intensityType: type,
            intensityMin: min,
            intensityMax: max,
          })
        }
      />
    </div>
  );
};

export default IntervalForm;
