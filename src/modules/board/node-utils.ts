import type { Node } from "@xyflow/react";
import { useMemo } from "react";
import "@xyflow/react/dist/style.css";

import type { Doc, Id } from "convex/_generated/dataModel";

export const useBoardNodes = (board: Doc<"boards">) => {
  const staticNodes = useMemo(() => getAxisNodes(board), [board]);

  const nodes = useMemo(
    () => [...staticNodes, ...board.tasks],
    [board.tasks, staticNodes],
  );

  return nodes;
};

const DEFAULT_AXIS_SIZE = 200;

const getPositions = (entries: Doc<"boards">["axisX"]) => {
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
  boardId: Id<"boards">;
  entries: Doc<"boards">["axisX"];
  positions: number[];
  orientation: "vertical" | "horizontal";
};

const mapAxisToNodes = ({
  boardId,
  entries,
  orientation,
  positions,
}: MapAxisToNodesArgs) => {
  return entries.map(
    (axis, index) =>
      ({
        connectable: false,
        data: {
          boardId,
          index,
          label: axis.name,
          orientation,
        },
        deletable: false,
        draggable: false,
        id: axis.id,
        position:
          orientation === "horizontal"
            ? { x: positions[index], y: -DEFAULT_AXIS_SIZE }
            : { x: -DEFAULT_AXIS_SIZE, y: positions[index] },
        style:
          orientation === "horizontal"
            ? { height: DEFAULT_AXIS_SIZE, width: axis.size }
            : { height: axis.size, width: DEFAULT_AXIS_SIZE },
        type: "axis",
      }) satisfies Node,
  );
};

const getParentId = (axisX: string, axisY: string) => {
  return `${axisX}-${axisY}`;
};

type MapAxisToGroupNodesArgs = {
  board: Doc<"boards">;
  horizontalPositions: number[];
  verticalPositions: number[];
};

const mapAxisToGroupNodes = ({
  horizontalPositions,
  verticalPositions,
  board,
}: MapAxisToGroupNodesArgs) => {
  return board.axisX.flatMap((axisX, column) => {
    return board.axisY.map((axisY, row) => {
      return {
        connectable: false,
        data: {
          axisX: axisX.id,
          axisY: axisY.id,
          boardId: board._id,
          label: `H:${axisX.name}-V:${axisY.name}`,
        },
        deletable: false,
        draggable: false,
        id: getParentId(axisX.id, axisY.id),
        position: { x: horizontalPositions[column], y: verticalPositions[row] },
        style: { height: axisY.size, width: axisX.size },
        type: "group" as const,
      } satisfies Node;
    });
  });
};

const getAxisNodes = (board: Doc<"boards">) => {
  const horizontalPositions = getPositions(board.axisX);
  const verticalPositions = getPositions(board.axisY);

  return [
    ...mapAxisToNodes({
      boardId: board._id,
      entries: board.axisX,
      orientation: "horizontal",
      positions: horizontalPositions,
    }),
    ...mapAxisToNodes({
      boardId: board._id,
      entries: board.axisY,
      orientation: "vertical",
      positions: verticalPositions,
    }),
    ...mapAxisToGroupNodes({
      board,
      horizontalPositions,
      verticalPositions,
    }),
  ];
};

export type NodeResult = ReturnType<typeof useBoardNodes>[0];
export type AxisResult = ReturnType<typeof mapAxisToNodes>[0];
export type TaskResult = Doc<"boards">["tasks"][0];
export type GroupResult = ReturnType<typeof mapAxisToGroupNodes>[0];
export type AxisOrientation = "horizontal" | "vertical";
