import { SignInForm } from "@/modules/auth/sign-in-form";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_forms/")({ component: SignInPage });

function SignInPage() {
  return <SignInForm />;
}
