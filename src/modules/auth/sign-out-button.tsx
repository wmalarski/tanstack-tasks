import { FormButton } from "@/components/ui/button";

import { useMutation } from "@tanstack/react-query";

import { useSignOutMutationOptions } from "./services";

export const SignOutButton = () => {
  const signOutMutationOptions = useSignOutMutationOptions();
  const signOutMutation = useMutation(signOutMutationOptions);

  const formAction = async () => {
    try {
      await signOutMutation.mutateAsync();
    } catch {}
  };

  return (
    <form action={formAction}>
      <FormButton type="submit">Sign Out</FormButton>
    </form>
  );
};
