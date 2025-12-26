import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { useAppForm } from "@/integrations/tanstack-form";

import { useMutation } from "@tanstack/react-query";

import { AuthFields } from "./auth-fields";
import { useSignInMutationOptions } from "./services";
import { AuthSchema } from "./validation";

export const SignInForm = () => {
  const signInOptions = useSignInMutationOptions();
  const signInMutation = useMutation(signInOptions);

  const signInForm = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async (data) => {
      console.log("[onSubmit-1]");
      try {
        await signInMutation.mutateAsync(data.value);
      } catch {}
      console.log("[onSubmit-2]");
    },
    validators: {
      onSubmit: AuthSchema,
    },
  });

  const formAction = async () => {
    console.log("[formAction-1]");
    await signInForm.handleSubmit();
    console.log("[formAction-2]");
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
