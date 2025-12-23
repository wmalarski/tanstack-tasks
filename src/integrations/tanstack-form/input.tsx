import { Input as UiInput } from "@/components/ui/input";

import type { ComponentProps } from "react";

import { useFieldContext } from "./contexts";

export const Input = (props: ComponentProps<typeof UiInput>) => {
  const field = useFieldContext<string>();

  return (
    <UiInput
      {...props}
      disabled={field.form.state.isSubmitting}
      name={field.name}
      onChange={(event) => field.handleChange(event.target.value)}
      value={field.state.value}
    />
  );
};
