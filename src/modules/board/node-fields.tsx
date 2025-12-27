import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { withForm } from "@/integrations/tanstack-form";

import * as v from "valibot";

export const NodeFieldsSchema = v.object({
  description: v.string(),
  estimate: v.pipe(v.string(), v.toNumber(), v.minValue(0), v.integer()),
  link: v.optional(v.string()),
  title: v.string(),
});

export type NodeFieldsResult = v.InferInput<typeof NodeFieldsSchema>;

export const NODE_FIELDS_DEFAULT: NodeFieldsResult = {
  description: "",
  estimate: "1",
  link: "",
  title: "",
};

type NodeFieldsProps = {
  error?: Error | null;
};

export const NodeFields = withForm({
  defaultValues: NODE_FIELDS_DEFAULT,
  props: {} as NodeFieldsProps,
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

          <form.AppField name="link">
            {(field) => (
              <Field data-invalid={!field.state.meta.isValid}>
                <FieldLabel>Link</FieldLabel>
                <field.Input placeholder="Link" width="full" />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.AppField>

          <form.AppField name="estimate">
            {(field) => (
              <Field data-invalid={!field.state.meta.isValid}>
                <FieldLabel>Estimate</FieldLabel>
                <field.Input
                  min={0}
                  placeholder="Title"
                  required
                  step={1}
                  type="number"
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
  validators: { onSubmit: NodeFieldsSchema },
});
