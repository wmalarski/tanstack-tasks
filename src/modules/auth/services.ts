import { authClient } from "@/integrations/better-auth/client";

import { mutationOptions, queryOptions } from "@tanstack/react-query";

import type { AuthSchemaOutput } from "./validation";

export const signInMutationOptions = () => {
  return mutationOptions({
    mutationFn: async (data: AuthSchemaOutput) => {
      const response = await authClient.signIn.email(data);

      if (response.error) {
        throw response.error;
      }

      return response.data;
    },
    onSuccess(data, _variables, _onMutate, context) {
      const queryOptions = getUserQueryOptions();
      context.client.setQueryData(queryOptions.queryKey, data.user);
    },
  });
};

export const signUpMutationOptions = () => {
  return mutationOptions({
    mutationFn: async (data: AuthSchemaOutput) => {
      const response = await authClient.signUp.email({
        ...data,
        name: data.email,
      });

      if (response.error) {
        throw response.error;
      }

      return response.data;
    },
    onSuccess(data, _variables, _onMutate, context) {
      const queryOptions = getUserQueryOptions();
      context.client.setQueryData(queryOptions.queryKey, data.user);
    },
  });
};

export const signOutMutationOptions = () => {
  return mutationOptions({
    mutationFn: async () => {
      const response = await authClient.signOut();

      if (response.error) {
        throw response.error;
      }

      return response.data;
    },
    onSuccess(_data, _variables, _onMutate, context) {
      const queryOptions = getUserQueryOptions();
      context.client.setQueryData(queryOptions.queryKey, undefined);
    },
  });
};

export const getUserQueryOptions = () => {
  return queryOptions({
    queryFn: async () => {
      const response = await authClient.getSession();

      if (response.error) {
        throw response.error;
      }

      return response.data?.user;
    },
    queryKey: ["getUserQuery"],
  });
};
