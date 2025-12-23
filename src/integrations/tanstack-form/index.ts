import { createFormHook } from "@tanstack/react-form";

import { Button } from "./button";
import { fieldContext, formContext } from "./contexts";
import { Input } from "./input";

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    Input,
  },
  fieldContext,
  formComponents: {
    Button,
  },
  formContext,
});
