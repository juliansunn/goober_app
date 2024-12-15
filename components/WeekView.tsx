"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Week } from "../types/skeleton";
import { format } from "date-fns";
import { Badge } from "./ui/badge";

interface WeekViewProps {
  week: Week;
}

export function WeekView({ week }: WeekViewProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Week {week.weekNumber}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-1">
          {formatDate(week.startDate)} - {formatDate(week.endDate)}
        </p>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm">Focus:</span>
          <Badge variant="secondary">{week.focus}</Badge>
        </div>
        <p className="text-sm mb-1">{week.description}</p>
        <p className="text-sm mb-2">
          <strong>Planned Volume:</strong> {week.volumeValue}
        </p>
        <Link href={`/generate-workouts/${week.weekNumber}`} passHref>
          <Button className="w-full" size="sm">
            View Weekly Schedule
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
