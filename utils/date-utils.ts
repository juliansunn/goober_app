import { addDays, format, getDay, startOfWeek } from "date-fns";

export function getWeekDates(startDate: Date): Date[] {
  const start = startOfWeek(startDate, { weekStartsOn: 1 }); // Assuming week starts on Monday
  console.log("start", start);

  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function stringToDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export const getDaySlots = (startDate: string) => {
  const weekDates = getWeekDates(stringToDate(startDate));

  return Array.from({ length: 7 }, (_, i) => {
    // Convert i to day number where Monday is 1 and Sunday is 7
    const dayNumber = i + 1;
    // Convert to date-fns day number (0-6) where Sunday is 0
    const dateFnsDay = dayNumber === 7 ? 0 : dayNumber;

    const matchingDate = weekDates.find((date) => getDay(date) === dateFnsDay);
    return {
      dayIndex: i,
      date: matchingDate,
    };
  });
};

interface WeekOutline {
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
}

export function generateWeekDatesFromStartAndEndDate(
  startDate: Date | string,
  endDate: Date | string
): WeekOutline[] {
  const weeks: WeekOutline[] = [];
  let currentDate = new Date(startDate);
  // convert startDate and endDate to Date if they are strings
  if (typeof startDate === "string") {
    startDate = new Date(startDate);
  }
  if (typeof endDate === "string") {
    endDate = new Date(endDate);
  }

  // Find the next Monday if we're not starting on a Monday
  const daysUntilMonday = (8 - currentDate.getDay()) % 7;
  const firstWeekEnd = new Date(currentDate);

  // Handle first partial week if not starting on Monday
  if (startDate.getDay() !== 1) {
    // 1 represents Monday
    firstWeekEnd.setDate(startDate.getDate() + daysUntilMonday - 1); // Sunday
    if (firstWeekEnd > endDate) {
      firstWeekEnd.setTime(endDate.getTime());
    }
    weeks.push({
      startDate: new Date(startDate),
      endDate: new Date(firstWeekEnd),
      numberOfDays:
        Math.ceil(
          (firstWeekEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1,
    });
    currentDate = new Date(firstWeekEnd);
    currentDate.setDate(currentDate.getDate() + 1); // Start from next Monday
  }

  // Generate full weeks
  while (currentDate < endDate) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6); // Add 6 days to get to Sunday

    // If this week extends beyond the end date, adjust it
    if (weekEnd > endDate) {
      weeks.push({
        startDate: weekStart,
        endDate: new Date(endDate),
        numberOfDays:
          Math.ceil(
            (endDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1,
      });
      break;
    }

    weeks.push({
      startDate: weekStart,
      endDate: weekEnd,
      numberOfDays: 7,
    });

    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeks;
}

export const formatDateString = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return format(new Date(year, month - 1, day), "MMM d, yyyy");
};
