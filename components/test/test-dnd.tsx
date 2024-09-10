"use client";
import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

export interface Item {
  id: number;
  name: string;
}

const ArrayItem = ({ id, name }: Item) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="bg-slate-200 rounded-md p-4 flex items-center flex-start gap-2"
    >
      <h1 className="text-3xl to-blue-950">{name}</h1>
    </div>
  );
};

type ColumnProps = {
  items: Item[];
};

const Column = ({ items }: ColumnProps) => {
  console.log(items);
  return (
    <div className="bg-slate-600 rounded-sm p-4 w-[80%] flex flex-col space-y-3 my-4 border border-2px">
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <ArrayItem key={item.id} id={item.id} name={item.name} />
        ))}
      </SortableContext>
    </div>
  );
};

type DragAndDropProps = { itemArray: Item[] };

const DragAndDrop = ({ itemArray }: DragAndDropProps) => {
  const [items, setItems] = useState<Item[]>(itemArray);

  const addItem = (name: string) => {
    setItems((items) => [...items, { id: items.length + 1, name }]);
  };

  const getItemPos = (id: number) => items.findIndex((item) => item.id === id);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id === over.id) return;

    setItems((items) => {
      const originalPos = getItemPos(active.id);
      const newPos = getItemPos(over.id);

      return arrayMove(items, originalPos, newPos);
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      <Column items={items} />
    </DndContext>
  );
};

export default DragAndDrop;
