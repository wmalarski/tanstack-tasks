import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { withForm } from "@/integrations/tanstack-form";

import { AuthSchema } from "./validation";

type AuthFieldsProps = {
  error?: Error | null;
};

export const AuthFields = withForm({
  defaultValues: { email: "", password: "" },
  props: {} as AuthFieldsProps,
  render: ({ form, error }) => {
    return (
      <FieldSet>
        <FormError message={error?.message} />

        <FieldGroup>
          <form.AppField name="email">
            {(field) => (
              <Field data-invalid={!field.state.meta.isValid}>
                <FieldLabel>Email</FieldLabel>
                <field.Input
                  inputMode="email"
                  placeholder="Email"
                  required
                  type="email"
                  width="full"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.AppField>

          <form.AppField name="password">
            {(field) => (
              <Field data-invalid={!field.state.meta.isValid}>
                <FieldLabel>Password</FieldLabel>
                <field.Input
                  name="password"
                  placeholder="Password"
                  required
                  type="password"
                  width="full"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.AppField>
        </FieldGroup>
      </FieldSet>
    );
  },
  validators: { onSubmit: AuthSchema },
});
