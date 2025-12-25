import { Link } from "@/components/ui/link";

import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";

import { InsertBoardDialog } from "./insert-board-dialog";

export const BoardList = () => {
  const getBoardsQuery = useSuspenseQuery(
    convexQuery(api.boards.queryBoards, {
      paginationOpts: {
        cursor: null,
        numItems: 10,
      },
    }),
  );

  return (
    <>
      <InsertBoardDialog />
      <ul>
        {getBoardsQuery.data.page.map((board) => (
          <BoardListItem board={board} key={board._id} />
        ))}
      </ul>
    </>
  );
};

type BoardListItemProps = {
  board: Doc<"boards">;
};

const BoardListItem = ({ board }: BoardListItemProps) => {
  return (
    <li>
      <pre>{JSON.stringify(board, null, 2)}</pre>
      <Link params={{ boardId: board._id }} to="/board/$boardId">
        Enter
      </Link>
    </li>
  );
};
