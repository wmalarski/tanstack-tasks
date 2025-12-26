import { SignOutButton } from "@/modules/auth/sign-out-button";

import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";

export const Route = createFileRoute("/_protected/boards")({
  component: RouteComponent,
});

function RouteComponent() {
  // const userQuery = useConvexQuery(api.users.viewer);
  const userQuery = useSuspenseQuery(convexQuery(api.auth.getCurrentUser));

  return (
    <div>
      Hello "/_protected/boards"!
      <SignOutButton />
      <pre>{JSON.stringify(userQuery.data, null, 2)}</pre>
      {/* <BoardList /> */}
    </div>
  );
}
