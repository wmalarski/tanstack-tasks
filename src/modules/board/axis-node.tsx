import type { NodeProps } from "@xyflow/react";
import type { Id } from "convex/_generated/dataModel";
import type { AxisResult } from "convex/nodes";

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
      <DeleteAxisPopover axisId={axisId} />
      <InsertAxisItemPopover
        boardId={data.boardId}
        index={data.index}
        orientation={data.orientation}
      />
    </div>
  );
};
