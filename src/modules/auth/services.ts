import { useAuthActions } from "@convex-dev/auth/react";
import { mutationOptions } from "@tanstack/react-query";

import type { AuthSchemaOutput } from "./validation";

const PASSWORD_PROVIDER = "password";

export const useSignInMutationOptions = () => {
  const { signIn } = useAuthActions();

  return mutationOptions({
    mutationFn: async (data: AuthSchemaOutput) => {
      const formData = new FormData();

      formData.set("email", data.email);
      formData.set("password", data.password);
      formData.set("flow", "signIn");

      return signIn(PASSWORD_PROVIDER, formData);
    },
    // onSuccess(data, _variables, _onMutate, context) {
    //   const queryOptions = getUserQueryOptions();
    //   context.client.setQueryData(queryOptions.queryKey, data.user);
    // },
  });
};

export const useSignUpMutationOptions = () => {
  const { signIn } = useAuthActions();

  return mutationOptions({
    mutationFn: async (data: AuthSchemaOutput) => {
      const formData = new FormData();

      formData.set("email", data.email);
      formData.set("password", data.password);
      formData.set("flow", "signUp");

      return signIn(PASSWORD_PROVIDER, formData);
    },
    // onSuccess(data, _variables, _onMutate, context) {
    //   const queryOptions = getUserQueryOptions();
    //   context.client.setQueryData(queryOptions.queryKey, data.user);
    // },
  });
};

export const useSignOutMutationOptions = () => {
  const { signOut } = useAuthActions();

  return mutationOptions({
    mutationFn: async () => {
      return signOut();
    },
    // onSuccess(_data, _variables, _onMutate, context) {
    //   const queryOptions = getUserQueryOptions();
    //   context.client.setQueryData(queryOptions.queryKey, undefined);
    // },
  });
};

// export const getUserQueryOptions = () => {
//   return queryOptions({
//     queryFn: async () => {
//       const response = await authClient.getSession();

//       if (response.error) {
//         throw response.error;
//       }

//       return response.data?.user;
//     },
//     queryKey: ["getUserQuery"],
//   });
// };
