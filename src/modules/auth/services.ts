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
      console.log("[mutationFn-1]");
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: true,
      });

      if (result.error) {
        throw result.error;
      }

      console.log("[mutationFn-2]");
      return result.data;
    },
    async onSuccess(data, _variables, _onMutate, _context) {
      // const userQueryOptions = convexQuery(api.auth.getCurrentUser);
      console.log("[onSuccess-1]", data);

      // context.client.setQueryData(userQueryOptions.queryKey, data.user);

      await navigate({ to: "/boards" });
      console.log("[onSuccess-2]");
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
    async onSuccess(data, _variables, _onMutate, context) {
      // const queryOptions = getUserQueryOptions();
      // context.client.setQueryData(queryOptions.queryKey, data.user);

      console.log("[data]", data);

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
