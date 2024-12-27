"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export type Schedule = {
  id: string;
  scheduleTitle: string;
  raceName: string;
  raceType: string;
  raceDistance: string;
  raceDate: Date;
  createdAt: Date;
};

export const columns: ColumnDef<Schedule>[] = [
  {
    accessorKey: "scheduleTitle",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Schedule Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <Link
          href={`/schedules/${row.original.id}`}
          className="text-blue-600 hover:underline"
        >
          {row.getValue("scheduleTitle")}
        </Link>
      );
    },
  },
  {
    accessorKey: "raceName",
    header: "Race Name",
  },
  {
    accessorKey: "raceType",
    header: "Type",
  },
  {
    accessorKey: "raceDistance",
    header: "Distance",
  },
  {
    accessorKey: "raceDate",
    header: "Race Date",
    cell: ({ row }) => {
      return formatDate(row.getValue("raceDate"));
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      return formatDate(row.getValue("createdAt"));
    },
  },
];
