import type { Node } from "@xyflow/react";

import type { Doc, Id } from "./_generated/dataModel";

const mapDocumentsToNodes = (
  tasks: Doc<"tasks">[],
  axis: Doc<"axis">[],
  boardId: Id<"boards">,
) => {
  const { horizontal, vertical } = getSortedAxis(axis);

  const verticalPositions = getPositions(vertical);
  const horizontalPositions = getPositions(horizontal);

  return [
    ...mapAxisToNodes({
      axis: vertical,
      boardId,
      orientation: "vertical",
      positions: verticalPositions,
    }),
    ...mapAxisToNodes({
      axis: horizontal,
      boardId,
      orientation: "horizontal",
      positions: horizontalPositions,
    }),
    ...mapAxisToGroupNodes({
      boardId,
      horizontal,
      horizontalPositions,
      vertical,
      verticalPositions,
    }),
    ...mapTasksToNodes(tasks),
  ];
};

const getParentId = (axisX: Id<"axis">, axisY: Id<"axis">) => {
  return `${axisX}-${axisY}`;
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
        id: doc._id,
        parentId: getParentId(doc.axisX, doc.axisY),
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

type MapAxisToNodesArgs = {
  axis: Doc<"axis">[];
  boardId: Id<"boards">;
  orientation: AxisOrientation;
  positions: number[];
};

const DEFAULT_AXIS_SIZE = 200;

const mapAxisToNodes = ({
  axis,
  boardId,
  orientation,
  positions,
}: MapAxisToNodesArgs) => {
  return axis.map((doc, index) => {
    const position = positions[index];
    return {
      data: { boardId, index: doc.index, label: doc.name, orientation },
      id: doc._id,
      position:
        doc.orientation === "horizontal"
          ? { x: position, y: -DEFAULT_AXIS_SIZE }
          : { x: -DEFAULT_AXIS_SIZE, y: position },
      style:
        doc.orientation === "horizontal"
          ? { height: DEFAULT_AXIS_SIZE, width: doc.size }
          : { height: doc.size, width: DEFAULT_AXIS_SIZE },
      type: "axis" as const,
    } satisfies Node;
  });
};

const getSortedAxis = (axis: Doc<"axis">[]) => {
  const vertical: Doc<"axis">[] = [];
  const horizontal: Doc<"axis">[] = [];

  axis.forEach((entry) => {
    (entry.orientation === "vertical" ? vertical : horizontal).push(entry);
  });

  vertical.sort(sortAxis);
  horizontal.sort(sortAxis);

  return { horizontal, vertical };
};

type MapAxisToGroupNodesArgs = {
  boardId: Id<"boards">;
  horizontal: Doc<"axis">[];
  vertical: Doc<"axis">[];
  horizontalPositions: number[];
  verticalPositions: number[];
};

const mapAxisToGroupNodes = ({
  boardId,
  horizontal,
  horizontalPositions,
  vertical,
  verticalPositions,
}: MapAxisToGroupNodesArgs) => {
  return horizontal.flatMap((axisX, column) => {
    return vertical.map((axisY, row) => {
      return {
        data: {
          axisX: axisX._id,
          axisY: axisY._id,
          boardId,
          label: `H:${axisY.name}-V:${axisX.name}`,
        },
        id: getParentId(axisX._id, axisY._id),
        position: { x: horizontalPositions[column], y: verticalPositions[row] },
        style: { height: axisY.size, width: axisX.size },
        type: "group" as const,
      } satisfies Node;
    });
  });
};

export type NodeResult = ReturnType<typeof mapDocumentsToNodes>[0];
export type AxisResult = ReturnType<typeof mapAxisToNodes>[0];
export type TaskResult = ReturnType<typeof mapTasksToNodes>[0];
export type GroupResult = ReturnType<typeof mapAxisToGroupNodes>[0];
export type AxisOrientation = Doc<"axis">["orientation"];
