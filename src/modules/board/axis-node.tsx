import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { type NodeProps, type ReactFlowState, useStore } from "@xyflow/react";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import { useMemo } from "react";

import {
  DeleteAxisPopover,
  InsertAxisItemPopover,
  UpdateAxisItemPopover,
} from "./axis-dialogs";
import type { AxisOrientation, AxisResult, NodeResult } from "./node-utils";

type AxisNodeProps = NodeProps & {
  data: AxisResult["data"];
};

export const AxisNode = ({ data, id }: AxisNodeProps) => {
  const getBoardQuery = useSuspenseQuery(
    convexQuery(api.boards.queryBoard, { boardId: data.boardId }),
  );

  return (
    <div className="flex flex-col items-start">
      <span>{data.label}</span>
      <UpdateAxisItemPopover
        axisId={id}
        board={getBoardQuery.data}
        orientation={data.orientation}
      />
      <DeleteAxisItem
        axisId={id}
        board={getBoardQuery.data}
        orientation={data.orientation}
      />
      <InsertAxisItemPopover
        axisId={id}
        board={getBoardQuery.data}
        orientation={data.orientation}
      />
      <AxisSummary axisId={id} />
    </div>
  );
};

const axisCountSelectorFactory =
  (orientation: AxisOrientation) => (state: ReactFlowState) => {
    const axis = state.nodes.filter(
      (node) => node.type === "axis" && node.data.orientation === orientation,
    );
    return axis.length;
  };

type DeleteAxisItemProps = {
  axisId: string;
  orientation: AxisOrientation;
  board: Doc<"boards">;
};

const DeleteAxisItem = ({
  axisId,
  board,
  orientation,
}: DeleteAxisItemProps) => {
  const axisCountSelector = useMemo(
    () => axisCountSelectorFactory(orientation),
    [orientation],
  );

  const axisCount = useStore(axisCountSelector);

  if (axisCount < 2) {
    return null;
  }

  return (
    <DeleteAxisPopover
      axisId={axisId}
      board={board}
      orientation={orientation}
    />
  );
};

const estimationCountSelectorFactory =
  (axisId: string) => (state: ReactFlowState) => {
    const typedState = state as unknown as ReactFlowState<NodeResult>;

    const estimates = typedState.nodes.map((node) => {
      if ("type" in node) {
        return 0;
      }

      if (node.data.axisX !== axisId && node.data.axisY !== axisId) {
        return 0;
      }

      return node.data.estimate;
    });

    return estimates.reduce((prev, current) => prev + current, 0);
  };

type AxisSummaryProps = {
  axisId: string;
};

const AxisSummary = ({ axisId }: AxisSummaryProps) => {
  const estimationCountSelector = useMemo(
    () => estimationCountSelectorFactory(axisId),
    [axisId],
  );
  const estimationCount = useStore(estimationCountSelector);

  return <span>{`Count: ${estimationCount}`}</span>;
};
