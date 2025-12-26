import { authClient } from "@/integrations/better-auth/client";

import { convexQuery } from "@convex-dev/react-query";
import { mutationOptions } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";

import type { AuthSchemaOutput } from "./validation";

export const useSignInMutationOptions = () => {
  const navigate = useNavigate();

  return mutationOptions({
    mutationFn: async (data: AuthSchemaOutput) => {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: true,
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    },
    async onSuccess() {
      await navigate({ to: "/boards" });
    },
  });
};

export const useSignUpMutationOptions = () => {
  const navigate = useNavigate();

  return mutationOptions({
    mutationFn: async (data: AuthSchemaOutput) => {
      const result = await authClient.signUp.email({
        email: data.email,
        name: data.email,
        password: data.password,
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    },
    async onSuccess() {
      await navigate({ to: "/" });
    },
  });
};

export const useSignOutMutationOptions = () => {
  const navigate = useNavigate();

  return mutationOptions({
    mutationFn: async () => {
      const result = await authClient.signOut();

      if (result.error) {
        throw result.error;
      }

      return result.data;
    },
    async onSuccess(_data, _variables, _onMutate, context) {
      const userQueryOptions = convexQuery(api.auth.getCurrentUser);
      context.client.setQueryData(userQueryOptions.queryKey, undefined);
      await navigate({ to: "/" });
    },
  });
};
