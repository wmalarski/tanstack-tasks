import { Button } from "@/components/ui/button";

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { startTransition } from "react";

import { useSignOutMutationOptions } from "./services";

export const SignOutButton = () => {
  const signOutMutation = useMutation(useSignOutMutationOptions());

  const navigate = useNavigate();

  const formAction = async () => {
    await signOutMutation.mutateAsync();

    startTransition(async () => {
      await navigate({ to: "/" });
    });
  };

  return (
    <form action={formAction}>
      <Button type="submit">Sign Out</Button>
    </form>
  );
};
