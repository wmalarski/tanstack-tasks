import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { useAppForm } from "@/integrations/tanstack-form";

import { useMutation } from "@tanstack/react-query";

import { AuthFields } from "./auth-fields";
import { useSignUpMutationOptions } from "./services";
import { AuthSchema } from "./validation";

export const SignUpForm = () => {
  const signInMutation = useMutation(useSignUpMutationOptions());

  const signUpForm = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async (data) => {
      try {
        await signInMutation.mutateAsync(data.value);
      } catch {}
    },
    validators: {
      onSubmit: AuthSchema,
    },
  });

  const formAction = async () => {
    await signUpForm.handleSubmit();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
      </CardHeader>
      <CardContent>
        <signUpForm.AppForm>
          <form action={formAction} className="flex flex-col gap-4">
            <AuthFields error={signInMutation.error} form={signUpForm} />
            <signUpForm.Button type="submit">Sign Up</signUpForm.Button>
            <Link to="/">Sign In</Link>
            <Link to="/boards">Boards</Link>
          </form>
        </signUpForm.AppForm>
      </CardContent>
    </Card>
  );
};
