import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import { Editor } from "./editor";

type BoardContentProps = {
  boardId: Id<"boards">;
};

export const BoardContent = ({ boardId }: BoardContentProps) => {
  const getNodesQuery = useSuspenseQuery(
    convexQuery(api.nodes.queryNodes, { boardId }),
  );

  const getEdgesQuery = useSuspenseQuery(
    convexQuery(api.edges.queryEdges, { boardId }),
  );

  const getBoardQuery = useSuspenseQuery(
    convexQuery(api.boards.queryBoard, { boardId }),
  );

  return (
    <Editor
      board={getBoardQuery.data}
      boardId={boardId}
      edges={getEdgesQuery.data}
      nodes={getNodesQuery.data}
    />
  );
};
