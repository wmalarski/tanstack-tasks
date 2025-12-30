import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import { Editor } from "./editor";

type BoardContentProps = {
  boardId: Id<"boards">;
};

export const BoardContent = ({ boardId }: BoardContentProps) => {
  const getBoardQuery = useSuspenseQuery(
    convexQuery(api.boards.queryBoard, { boardId }),
  );

  return <Editor board={getBoardQuery.data} />;
};
