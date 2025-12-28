import type { Node } from "@xyflow/react";
import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";

export const queryNodes = query({
  args: {
    boardId: v.id("boards"),
  },
  handler: async (ctx, args) => {
    const [tasks, axis] = await Promise.all([
      ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("board"), args.boardId))
        .collect(),
      ctx.db
        .query("axis")
        .filter((q) => q.eq(q.field("board"), args.boardId))
        .collect(),
    ]);

    return mapDocumentsToNodes(tasks, axis);
  },
});

const mapDocumentsToNodes = (tasks: Doc<"tasks">[], axis: Doc<"axis">[]) => {
  return [...mapTasksToNodes(tasks), ...mapAxisToNodes(axis)];
};

const mapTasksToNodes = (tasks: Doc<"tasks">[]) => {
  return tasks.map(
    (doc) =>
      ({
        data: {
          axisX: doc.axisX,
          axisY: doc.axisY,
          description: doc.description,
          estimate: doc.estimate,
          label: doc.title,
          link: doc.link,
        },
        deletable: false,
        id: doc._id,
        position: { x: doc.positionX, y: doc.positionY },
        type: "task" as const,
      }) satisfies Node,
  );
};

const sortAxis = (left: Doc<"axis">, right: Doc<"axis">) => {
  return left.index - right.index;
};

const getPositions = (entries: Doc<"axis">[]) => {
  return entries.reduce(
    (prev, current) => {
      const last = prev[prev.length - 1];
      prev.push(last + current.size);
      return prev;
    },
    [0],
  );
};

const mapAxisToNodeFactory = (axis: Doc<"axis">[], positions: number[]) => {
  return axis.map((doc, index) => {
    const position = positions[index];
    return {
      connectable: false,
      data: { index: doc.index, label: doc.name },
      deletable: false,
      draggable: false,
      id: doc._id,
      position:
        doc.orientation === "vertical"
          ? { x: position, y: 0 }
          : { x: 0, y: position },
      selectable: false,
      style:
        doc.orientation === "vertical"
          ? { height: 100, width: doc.size }
          : { height: doc.size, width: 100 },
      type: "axis" as const,
    } satisfies Node;
  });
};

const mapAxisToNodes = (axis: Doc<"axis">[]) => {
  const vertical: Doc<"axis">[] = [];
  const horizontal: Doc<"axis">[] = [];

  axis.forEach((entry) => {
    (entry.orientation === "vertical" ? vertical : horizontal).push(entry);
  });

  vertical.sort(sortAxis);
  horizontal.sort(sortAxis);

  const verticalPositions = getPositions(vertical);
  const horizontalPositions = getPositions(horizontal);

  return [
    ...mapAxisToNodeFactory(vertical, verticalPositions),
    ...mapAxisToNodeFactory(horizontal, horizontalPositions),
  ];
};

export type NodeResult = ReturnType<typeof mapDocumentsToNodes>[0];
export type AxisResult = ReturnType<typeof mapAxisToNodes>[0];
export type TaskResult = ReturnType<typeof mapTasksToNodes>[0];
