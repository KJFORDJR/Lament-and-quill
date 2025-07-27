import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface DraggableItem {
  id: string;
  [key: string]: any;
}

interface DragDropTableProps<T extends DraggableItem> {
  items: T[];
  onReorder: (items: T[]) => void;
  columns: Array<{
    key: string;
    header: string;
    render: (item: T) => React.ReactNode;
  }>;
  actionsColumn?: (item: T) => React.ReactNode;
  isReordering?: boolean;
}

function SortableRow<T extends DraggableItem>({ 
  item, 
  columns, 
  actionsColumn, 
  isReordering 
}: {
  item: T;
  columns: DragDropTableProps<T>['columns'];
  actionsColumn?: DragDropTableProps<T>['actionsColumn'];
  isReordering?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-red-500/10 hover:bg-red-500/5 ${
        isDragging ? 'bg-red-500/10' : ''
      }`}
    >
      {isReordering && (
        <td className="p-4 w-8">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gothic-silver/50 hover:text-gothic-silver/80"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        </td>
      )}
      {columns.map((column) => (
        <td key={column.key} className="p-4">
          {column.render(item)}
        </td>
      ))}
      {actionsColumn && (
        <td className="p-4">
          {actionsColumn(item)}
        </td>
      )}
    </tr>
  );
}

export function DragDropTable<T extends DraggableItem>({
  items,
  onReorder,
  columns,
  actionsColumn,
  isReordering = false,
}: DragDropTableProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);

      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-gothic-charcoal border border-red-500/20 rounded-lg">
        <thead>
          <tr className="border-b border-red-500/20">
            {isReordering && (
              <th className="text-left p-4 text-red-500 w-8"></th>
            )}
            {columns.map((column) => (
              <th key={column.key} className="text-left p-4 text-red-500">
                {column.header}
              </th>
            ))}
            {actionsColumn && (
              <th className="text-left p-4 text-red-500">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {isReordering ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                {items.map((item) => (
                  <SortableRow
                    key={item.id}
                    item={item}
                    columns={columns}
                    actionsColumn={actionsColumn}
                    isReordering={isReordering}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            items.map((item) => (
              <SortableRow
                key={item.id}
                item={item}
                columns={columns}
                actionsColumn={actionsColumn}
                isReordering={isReordering}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
