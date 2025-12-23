import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { withForm } from "@/integrations/tanstack-form";

import { type InsertBoardArgs, InsertBoardSchema } from "./validation";

type BoardFieldsProps = {
  error?: Error | null;
};

export const BoardFields = withForm({
  defaultValues: { description: "", title: "" } as InsertBoardArgs,
  props: {} as BoardFieldsProps,
  render: ({ form, error }) => {
    return (
      <FieldSet>
        <FormError message={error?.message} />

        <FieldGroup>
          <form.AppField name="title">
            {(field) => (
              <Field data-invalid={!field.state.meta.isValid}>
                <FieldLabel>Title</FieldLabel>
                <field.Input placeholder="Title" required width="full" />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.AppField>

          <form.AppField name="description">
            {(field) => (
              <Field data-invalid={!field.state.meta.isValid}>
                <FieldLabel>Description</FieldLabel>
                <field.Input placeholder="Description" width="full" />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.AppField>
        </FieldGroup>
      </FieldSet>
    );
  },
  validators: { onSubmit: InsertBoardSchema },
});
