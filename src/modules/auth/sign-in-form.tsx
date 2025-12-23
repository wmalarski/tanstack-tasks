import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { useAppForm } from "@/integrations/tanstack-form";

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { startTransition } from "react";

import { AuthFields } from "./auth-fields";
import { signInMutationOptions } from "./services";
import { AuthSchema } from "./validation";

export const SignInForm = () => {
  const signInMutation = useMutation(signInMutationOptions());

  const navigate = useNavigate();

  const signInForm = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async (data) => {
      await signInMutation.mutateAsync(data.value);
    },
    validators: {
      onSubmit: AuthSchema,
    },
  });

  const formAction = async () => {
    await signInForm.handleSubmit();

    startTransition(async () => {
      await navigate({ to: "/boards" });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <signInForm.AppForm>
          <form action={formAction} className="flex flex-col gap-4">
            <AuthFields error={signInMutation.error} form={signInForm} />
            <signInForm.Button type="submit">Sign In</signInForm.Button>
            <Link to="/sign-up">Sign Up</Link>
          </form>
        </signInForm.AppForm>
      </CardContent>
    </Card>
  );
};
