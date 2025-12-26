import { SignOutButton } from "@/modules/auth/sign-out-button";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/boards")({
  component: RouteComponent,
});

function RouteComponent() {
  // const userQuery = useConvexQuery(api.users.viewer);
  // const userQuery = useSuspenseQuery(convexQuery(api.users.viewer));

  return (
    <div>
      Hello "/_protected/boards"!
      <SignOutButton />
      {/* <pre>{JSON.stringify(userQuery, null, 2)}</pre> */}
      {/* <BoardList /> */}
    </div>
  );
}
