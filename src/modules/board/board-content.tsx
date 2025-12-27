import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import {
  DeleteAxisPopover,
  InsertAxisItemPopover,
  UpdateAxisItemPopover,
} from "./axis-dialogs";
import { Editor } from "./editor";

type BoardContentProps = {
  boardId: Id<"boards">;
};

export const BoardContent = ({ boardId }: BoardContentProps) => {
  return (
    <>
      <BoardAxis boardId={boardId} />
      <BoardEditor boardId={boardId} />
    </>
  );
};

type BoardEditorProps = {
  boardId: Id<"boards">;
};

const BoardEditor = ({ boardId }: BoardEditorProps) => {
  const getNodesQuery = useSuspenseQuery(
    convexQuery(api.nodes.queryNodes, { boardId }),
  );

  const getEdgesQuery = useSuspenseQuery(
    convexQuery(api.edges.queryEdges, { boardId }),
  );

  return (
    <Editor
      boardId={boardId}
      edges={getEdgesQuery.data}
      nodes={getNodesQuery.data}
    />
  );
};

type BoardAxisProps = {
  boardId: Id<"boards">;
};

const BoardAxis = ({ boardId }: BoardAxisProps) => {
  const getBoardQuery = useSuspenseQuery(
    convexQuery(api.boards.queryBoard, { boardId }),
  );

  return (
    <>
      <div>
        <pre>{JSON.stringify(getBoardQuery.data, null, 2)}</pre>
        <span>X</span>
        {getBoardQuery.data.axis.x.map((item, index) => (
          <div key={item.id}>
            <span>{item.name}</span>
            <UpdateAxisItemPopover
              axisKey="x"
              board={getBoardQuery.data}
              index={index}
            />
            <DeleteAxisPopover
              axisKey="x"
              board={getBoardQuery.data}
              index={index}
            />
            <InsertAxisItemPopover
              axisKey="x"
              board={getBoardQuery.data}
              index={index}
            />
          </div>
        ))}
        {getBoardQuery.data.axis.x.length === 0 ? (
          <InsertAxisItemPopover
            axisKey="x"
            board={getBoardQuery.data}
            index={0}
          />
        ) : null}
      </div>
      <div>
        <span>Y</span>
        {getBoardQuery.data.axis.y.map((item, index) => (
          <div key={item.id}>
            <span>{item.name}</span>
            <UpdateAxisItemPopover
              axisKey="y"
              board={getBoardQuery.data}
              index={index}
            />
            <DeleteAxisPopover
              axisKey="y"
              board={getBoardQuery.data}
              index={index}
            />
            <InsertAxisItemPopover
              axisKey="y"
              board={getBoardQuery.data}
              index={index}
            />
          </div>
        ))}
        {getBoardQuery.data.axis.y.length === 0 ? (
          <InsertAxisItemPopover
            axisKey="y"
            board={getBoardQuery.data}
            index={0}
          />
        ) : null}
      </div>
    </>
  );
};
