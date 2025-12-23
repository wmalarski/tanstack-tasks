import { Link } from "@/components/ui/link";

import { useSuspenseQuery } from "@tanstack/react-query";

import { InsertBoardDialog } from "./insert-board-dialog";
import { type GetBoardsReturnItem, getBoardsQueryOptions } from "./services";

export const BoardList = () => {
  const getBoardsQuery = useSuspenseQuery(getBoardsQueryOptions({ page: 0 }));

  return (
    <>
      <InsertBoardDialog />
      <ul>
        {getBoardsQuery.data.map((board) => (
          <BoardListItem board={board} key={board.id} />
        ))}
      </ul>
    </>
  );
};

type BoardListItemProps = {
  board: GetBoardsReturnItem;
};

const BoardListItem = ({ board }: BoardListItemProps) => {
  return (
    <li>
      <pre>{JSON.stringify(board, null, 2)}</pre>
      <Link params={{ boardId: board.id }} to="/board/$boardId">
        Enter
      </Link>
    </li>
  );
};
