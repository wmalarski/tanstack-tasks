import { SignOutButton } from "@/modules/auth/sign-out-button";
import { BoardList } from "@/modules/board/board-list";

import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";

export const Route = createFileRoute("/_protected/boards")({
  component: RouteComponent,
});

function RouteComponent() {
  const userQuery = useSuspenseQuery(convexQuery(api.users.viewer));

  return (
    <div>
      Hello "/_protected/boards"!
      <SignOutButton />
      <pre>{JSON.stringify(userQuery.data, null, 2)}</pre>
      <BoardList />
    </div>
  );
}
