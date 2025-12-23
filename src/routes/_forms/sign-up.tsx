import { SignUpForm } from "@/modules/auth/sign-up-form";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_forms/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  return <SignUpForm />;
}
