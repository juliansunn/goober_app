import { addDays, parseISO, startOfWeek } from 'date-fns'

export function getWeekDates(startDate: string): Date[] {
  const start = startOfWeek(parseISO(startDate), { weekStartsOn: 1 }) // Assuming week starts on Monday
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

