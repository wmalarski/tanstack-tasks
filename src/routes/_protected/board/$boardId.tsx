import { BoardContent } from "@/modules/board/board-content";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/board/$boardId")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();

  return <BoardContent boardId={params.boardId} />;
}
