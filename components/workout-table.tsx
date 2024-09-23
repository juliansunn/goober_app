'use client'

import React from 'react'
import { Star, ChevronDown, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table"

type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced'

interface Workout {
  id: number
  title: string
  description: string
  skillLevel: SkillLevel
  popularity: number
  duration: string
}

const workouts: Workout[] = [
  {
    id: 1,
    title: "Full Body HIIT",
    description: "High-intensity interval training targeting all major muscle groups for a complete body workout.",
    skillLevel: "Intermediate",
    popularity: 95,
    duration: "30 minutes"
  },
  {
    id: 2,
    title: "Yoga for Beginners",
    description: "A gentle introduction to basic yoga poses and breathing techniques for improved flexibility and relaxation.",
    skillLevel: "Beginner",
    popularity: 88,
    duration: "45 minutes"
  },
  {
    id: 3,
    title: "Advanced Powerlifting",
    description: "Intense strength training focusing on squat, bench press, and deadlift for experienced lifters.",
    skillLevel: "Advanced",
    popularity: 92,
    duration: "1 hour"
  },
  {
    id: 4,
    title: "Cardio Kickboxing",
    description: "A high-energy workout combining martial arts techniques with fast-paced cardio for improved stamina and coordination.",
    skillLevel: "Intermediate",
    popularity: 90,
    duration: "45 minutes"
  },
  {
    id: 5,
    title: "Senior Fitness",
    description: "Low-impact exercises designed to improve balance, flexibility, and strength for older adults.",
    skillLevel: "Beginner",
    popularity: 85,
    duration: "30 minutes"
  },
]

const truncateDescription = (description: string, maxLength: number) => {
  if (description.length <= maxLength) return description
  return description.slice(0, maxLength) + '...'
}

const getSkillLevelColor = (skillLevel: SkillLevel) => {
  switch (skillLevel) {
    case 'Beginner':
      return 'bg-green-100 text-green-800'
    case 'Intermediate':
      return 'bg-yellow-100 text-yellow-800'
    case 'Advanced':
      return 'bg-red-100 text-red-800'
  }
}

export function WorkoutTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')

  const columns: ColumnDef<Workout>[] = [
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
        const skillLevel = row.getValue("skillLevel") as SkillLevel
        return (
          <Badge className={getSkillLevelColor(skillLevel)}>
            {skillLevel}
          </Badge>
        )
      },
    },
    {
      accessorKey: "popularity",
      header: "Popularity",
      cell: ({ row }) => {
        const popularity = row.getValue("popularity") as number
        return (
          <div className="flex items-center justify-end">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span>{popularity}%</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const workout = row.original
        return (
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
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

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
  })

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
                    <TableRow className="cursor-pointer">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">{row.original.title}</h4>
                      <p className="text-sm">{row.original.description}</p>
                      <div className="flex items-center pt-2">
                        <Badge className={`${getSkillLevelColor(row.original.skillLevel)} mr-2`}>
                          {row.original.skillLevel}
                        </Badge>
                        <span className="flex items-center text-sm text-muted-foreground">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          {row.original.popularity}% popularity
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground pt-2">
                        <Clock className="w-4 h-4 mr-2" />
                        Duration: {row.original.duration}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}