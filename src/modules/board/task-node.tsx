import { Badge } from "@/components/ui/badge";
import { BasicLink } from "@/components/ui/link";

import type { NodeProps } from "@xyflow/react";

import { useBoardContext } from "./board-context";
import type { TaskResult } from "./node-utils";
import { UpdateTaskDialog } from "./update-task-dialog";

type TaskNodeProps = NodeProps & {
  data: TaskResult["data"];
};

export const TaskNode = ({ data, id }: TaskNodeProps) => {
  const { boardId } = useBoardContext();

  return (
    <div className="flex flex-col items-start">
      <div>
        <span className="text-lg">{data.title}</span>
        {data.link ? <BasicLink href={data.link}>{data.link}</BasicLink> : null}
      </div>
      <span className="text-muted-foreground text-sm">{data.description}</span>
      <UpdateTaskDialog boardId={boardId} taskData={data} taskId={id} />
      <Badge>{data.estimate}</Badge>
    </div>
  );
};
