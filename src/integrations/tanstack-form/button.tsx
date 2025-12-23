import { Button as UiButton } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import type { ComponentProps } from "react";

import { useFormContext } from "./contexts";

export const Button = ({
  children,
  ...props
}: ComponentProps<typeof UiButton>) => {
  const form = useFormContext();

  return (
    <UiButton {...props} disabled={form.state.isSubmitting}>
      {form.state.isSubmitting ? <Spinner /> : null}
      {children}
    </UiButton>
  );
};
