import type { NodeProps } from "@xyflow/react";
import type { GroupResult } from "convex/nodes";

import { InsertTaskDialog } from "./insert-task-dialog";

type GroupNodeProps = NodeProps & {
  data: GroupResult["data"];
};

export const GroupNode = ({ data }: GroupNodeProps) => {
  return (
    <div className="flex flex-col items-start">
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <InsertTaskDialog
        axisX={data.axisX}
        axisY={data.axisY}
        boardId={data.boardId}
      />
    </div>
  );
};
