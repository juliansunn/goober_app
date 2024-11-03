"use client";

import React, { useState } from "react";
import {
  Star,
  ChevronDown,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { WorkoutBuilder } from "@/components/workout-builder";

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
  const [isAddWorkoutModalOpen, setIsAddWorkoutModalOpen] = useState(false);

  const columns: ColumnDef<Workout>[] = [
    {
      accessorKey: "type",
      header: ({ column }) => (
        <div
          className="text-center cursor-pointer select-none"
          onClick={() => column.toggleSorting()}
        >
          Type
          {column.getIsSorted() && (
            <span className="ml-2">
              {column.getIsSorted() === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
      ),
      cell: ({ row }) => {
        const workoutType = row.getValue("type") as string;
        return (
          <div className="flex items-center justify-center">
            {workoutType === WorkoutType.SWIM && (
              <LiaSwimmerSolid className="w-4 h-4" />
            )}
            {workoutType === WorkoutType.BIKE && (
              <RiBikeLine className="w-4 h-4" />
            )}
            {workoutType === WorkoutType.RUN && (
              <RiRunLine className="w-4 h-4" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <div
          className="text-left cursor-pointer select-none"
          onClick={() => column.toggleSorting()}
        >
          Title
          {column.getIsSorted() && (
            <span className="ml-2">
              {column.getIsSorted() === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-left">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <div
          className="text-left cursor-pointer select-none"
          onClick={() => column.toggleSorting()}
        >
          Description
          {column.getIsSorted() && (
            <span className="ml-2">
              {column.getIsSorted() === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
      ),
      cell: ({ row }) => (
        <div className="hidden md:block text-left">
          {truncateDescription(row.getValue("description"), 100)}
        </div>
      ),
    },
    {
      accessorKey: "skillLevel",
      header: ({ column }) => (
        <div
          className="text-center cursor-pointer select-none"
          onClick={() => column.toggleSorting()}
        >
          Skill Level
          {column.getIsSorted() && (
            <span className="ml-2">
              {column.getIsSorted() === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
      ),
      cell: ({ row }) => {
        const skillLevel = row.getValue("skillLevel") as SkillLevel;
        return (
          <div className="text-center">
            <Badge className={getSkillLevelColor(skillLevel)}>
              {skillLevel}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "popularity",
      header: ({ column }) => (
        <div
          className="text-right cursor-pointer select-none"
          onClick={() => column.toggleSorting()}
        >
          Popularity
          {column.getIsSorted() && (
            <span className="ml-2">
              {column.getIsSorted() === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
      ),
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
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  const columnWidths = {
    type: "w-[60px]",
    title: "w-[200px]",
    description: "w-[400px]",
    skillLevel: "w-[120px]",
    popularity: "w-[100px]",
    actions: "w-[60px]",
  };

  return (
    <div className="container h-[calc(91vh)] flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search workouts..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <Dialog
          open={isAddWorkoutModalOpen}
          onOpenChange={setIsAddWorkoutModalOpen}
        >
          <DialogTrigger asChild>
            <Button>Add Workout</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px]">
            <div className="flex h-[600px]">
              <div className="w-1/3 border-r pr-4">
                <WorkoutBuilder
                  onSave={() => setIsAddWorkoutModalOpen(false)}
                />
              </div>
              <div className="w-2/3 pl-4">
                <h3 className="text-lg font-semibold mb-2">Workout Preview</h3>
                <p>Preview of the workout will be shown here.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative flex-grow border rounded-md">
        <div className="absolute inset-0 flex flex-col">
          <div className="relative">
            <Table>
              <TableHeader className="sticky top-0 bg-secondary">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={`bg-background h-12 ${
                          columnWidths[header.id as keyof typeof columnWidths]
                        }`}
                      >
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
            </Table>
          </div>

          <div className="flex-grow overflow-auto">
            <Table>
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
                            <TableCell
                              key={cell.id}
                              className={
                                columnWidths[
                                  cell.column.id as keyof typeof columnWidths
                                ]
                              }
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">
                            {row.original.title}
                          </h4>
                          <p className="text-sm">{row.original.description}</p>
                          <div className="flex items-center pt-2">
                            <Badge
                              className={`${getSkillLevelColor(
                                "Advanced"
                              )} mr-2`}
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
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto">
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
              {[25, 50, 100, 200].map((size) => (
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
