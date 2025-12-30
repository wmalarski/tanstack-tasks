import type { NodeProps } from "@xyflow/react";

import { InsertTaskDialog } from "./insert-task-dialog";
import type { GroupResult } from "./node-utils";

type GroupNodeProps = NodeProps & {
  data: GroupResult["data"];
};

export const GroupNode = ({ data }: GroupNodeProps) => {
  return (
    <div className="flex flex-col items-start">
      <pre>{data.label}</pre>
      <InsertTaskDialog
        axisX={data.axisX}
        axisY={data.axisY}
        boardId={data.boardId}
      />
    </div>
  );
};
