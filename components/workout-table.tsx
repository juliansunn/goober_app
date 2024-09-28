"use client";

import React, { useState } from "react";
import {
  Star,
  ChevronDown,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { RiBikeLine, RiRunLine } from "react-icons/ri";
import { LiaSwimmerSolid } from "react-icons/lia";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Workout, WorkoutType } from "@/types/workouts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeleteWorkout } from "@/hooks/use-delete-workout";
import { ConfirmationDialog } from "@/components/confirm-dialog";

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

const truncateDescription = (description: string, maxLength: number) => {
  if (description.length <= maxLength) return description;
  return description.slice(0, maxLength) + "...";
};

const getSkillLevelColor = (skillLevel: SkillLevel) => {
  switch (skillLevel) {
    case "Beginner":
      return "bg-green-100 text-green-800";
    case "Intermediate":
      return "bg-yellow-100 text-yellow-800";
    case "Advanced":
      return "bg-red-100 text-red-800";
  }
};

export interface WorkoutTableProps {
  workouts: Workout[];
  currentPage: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function WorkoutTable({
  workouts,
  currentPage,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
}: WorkoutTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);
  const deleteWorkoutMutation = useDeleteWorkout();

  const columns: ColumnDef<Workout>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const workoutType = row.getValue("type") as string;
        return (
          <div className="flex items-center justify-center">
            {workoutType === WorkoutType.SWIM && (
              <LiaSwimmerSolid className="w-4 h-4 mr-2" />
            )}
            {workoutType === WorkoutType.BIKE && (
              <RiBikeLine className="w-4 h-4 mr-2" />
            )}
            {workoutType === WorkoutType.RUN && (
              <RiRunLine className="w-4 h-4 mr-2" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="hidden md:block">
          {truncateDescription(row.getValue("description"), 100)}
        </div>
      ),
    },
    {
      accessorKey: "skillLevel",
      header: "Skill Level",
      cell: ({ row }) => {
        const skillLevel = row.getValue("skillLevel") as SkillLevel;
        return (
          <Badge className={getSkillLevelColor("Advanced")}>SKILL LEVEL</Badge>
        );
      },
    },
    {
      accessorKey: "popularity",
      header: "Popularity",
      cell: ({ row }) => {
        const popularity = row.getValue("popularity") as number;
        return (
          <div className="flex items-center justify-end">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span>{popularity}%</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const workout = row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View details</DropdownMenuItem>
                <DropdownMenuItem>Add to favorites</DropdownMenuItem>
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setWorkoutToDelete(workout)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: workouts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-2xl font-bold mb-4">Workout Library</h2>
      <div className="flex items-center py-4">
        <Input
          placeholder="Search workouts..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <HoverCard key={row.id}>
                  <HoverCardTrigger asChild>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/workouts/${row.original.id}`)
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">
                        {row.original.title}
                      </h4>
                      <p className="text-sm">{row.original.description}</p>
                      <div className="flex items-center pt-2">
                        <Badge
                          className={`${getSkillLevelColor("Advanced")} mr-2`}
                        >
                          SKILL LEVEL
                        </Badge>
                        <span className="flex items-center text-sm text-muted-foreground">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          10% popularity
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground pt-2">
                        <Clock className="w-4 h-4 mr-2" />
                        Duration: 60 minutes
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground pt-2">
                        {row.original.type === WorkoutType.SWIM && (
                          <LiaSwimmerSolid className="w-4 h-4 mr-2" />
                        )}
                        {row.original.type === WorkoutType.BIKE && (
                          <RiBikeLine className="w-4 h-4 mr-2" />
                        )}
                        {row.original.type === WorkoutType.RUN && (
                          <RiRunLine className="w-4 h-4 mr-2" />
                        )}
                        <span className="capitalize">
                          Type: {row.original.type}
                        </span>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ConfirmationDialog
        isOpen={!!workoutToDelete}
        onClose={() => setWorkoutToDelete(null)}
        onConfirm={() => {
          if (workoutToDelete?.id) {
            deleteWorkoutMutation.mutate(workoutToDelete.id.toString());
            setWorkoutToDelete(null);
          }
        }}
        title="Delete Workout"
        description={`Are you sure you want to delete the workout "${workoutToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <span>Show</span>
          <Select
            value={limit.toString()}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue>{limit}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>per page</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="mr-4">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
