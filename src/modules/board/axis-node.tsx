import { type NodeProps, type ReactFlowState, useStore } from "@xyflow/react";
import type { Id } from "convex/_generated/dataModel";
import type { AxisOrientation, AxisResult, NodeResult } from "convex/nodes";
import { useMemo } from "react";

import {
  DeleteAxisPopover,
  InsertAxisItemPopover,
  UpdateAxisItemPopover,
} from "./axis-dialogs";

type AxisNodeProps = NodeProps & {
  data: AxisResult["data"];
};

export const AxisNode = ({ data, id }: AxisNodeProps) => {
  const axisId = id as Id<"axis">;

  return (
    <div className="flex flex-col items-start">
      <span>{data.label}</span>
      <UpdateAxisItemPopover axisId={axisId} />
      <DeleteAxisItem axisId={axisId} orientation={data.orientation} />
      <InsertAxisItemPopover
        boardId={data.boardId}
        index={data.index}
        orientation={data.orientation}
      />
      <AxisSummary axisId={axisId} />
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
  axisId: Id<"axis">;
  orientation: AxisOrientation;
};

const DeleteAxisItem = ({ axisId, orientation }: DeleteAxisItemProps) => {
  const axisCountSelector = useMemo(
    () => axisCountSelectorFactory(orientation),
    [orientation],
  );

  const axisCount = useStore(axisCountSelector);

  if (axisCount < 2) {
    return null;
  }

  return <DeleteAxisPopover axisId={axisId} />;
};

type AxisSummaryProps = {
  axisId: Id<"axis">;
};

const estimationCountSelectorFactory =
  (axisId: Id<"axis">) => (state: ReactFlowState) => {
    const typedState = state as unknown as ReactFlowState<NodeResult>;

    const estimates = typedState.nodes.map((node) => {
      if (node.type !== "task") {
        return 0;
      }

      if (node.data.axisX !== axisId && node.data.axisY !== axisId) {
        return 0;
      }

      return node.data.estimate;
    });

    return estimates.reduce((prev, current) => prev + current, 0);
  };

const AxisSummary = ({ axisId }: AxisSummaryProps) => {
  const estimationCountSelector = useMemo(
    () => estimationCountSelectorFactory(axisId),
    [axisId],
  );
  const estimationCount = useStore(estimationCountSelector);

  return <span>{`Count: ${estimationCount}`}</span>;
};
