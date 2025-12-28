import type { NodeProps } from "@xyflow/react";

type GroupNodeProps = NodeProps;

export const GroupNode = ({ data }: GroupNodeProps) => {
  return (
    <div className="flex flex-col items-start">
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {/* <InsertTaskDialog
        boardId={boardId}
        isOpen={isInsertNodeOpen}
        onIsOpenChange={setIsInsertNodeOpen}
      /> */}
    </div>
  );
};
