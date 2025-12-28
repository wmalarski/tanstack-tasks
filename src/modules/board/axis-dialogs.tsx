import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import {
  Popover,
  PopoverContent,
  PopoverPositioner,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { useAppForm, withForm } from "@/integrations/tanstack-form";

import { useMutation } from "@tanstack/react-query";
import type { Id } from "convex/_generated/dataModel";
import type { AxisOrientation } from "convex/nodes";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import * as v from "valibot";

import {
  useDeleteAxisMutationOptions,
  useInsertAxisMutationOptions,
  useUpdateAxisMutationOptions,
} from "./services";

const AxisFieldsSchema = v.object({
  name: v.string(),
});

type AxisFieldsArgs = v.InferInput<typeof AxisFieldsSchema>;

type AxisFieldsProps = {
  error?: Error | null;
};

const AxisFields = withForm({
  defaultValues: { name: "name" } as AxisFieldsArgs,
  props: {} as AxisFieldsProps,
  render: ({ form, error }) => {
    return (
      <FieldSet>
        <FormError message={error?.message} />

        <FieldGroup>
          <form.AppField name="name">
            {(field) => (
              <Field data-invalid={!field.state.meta.isValid}>
                <FieldLabel>Name</FieldLabel>
                <field.Input placeholder="Name" required width="full" />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.AppField>
        </FieldGroup>
      </FieldSet>
    );
  },
  validators: { onSubmit: AxisFieldsSchema },
});

type InsertAxisFormProps = {
  index: number;
  boardId: Id<"boards">;
  orientation: AxisOrientation;
  onSuccess: () => void;
};

const InsertAxisForm = ({
  index,
  boardId,
  orientation,
  onSuccess,
}: InsertAxisFormProps) => {
  const insertAxisMutationOptions = useInsertAxisMutationOptions({
    onSuccess,
  });
  const insertAxisMutation = useMutation(insertAxisMutationOptions);

  const updateBoardForm = useAppForm({
    defaultValues: { name: "" } as AxisFieldsArgs,
    onSubmit: async (data) => {
      await insertAxisMutation.mutateAsync({
        boardId,
        index,
        name: data.value.name,
        orientation,
      });
    },
    validators: { onSubmit: AxisFieldsSchema },
  });

  const formAction = async () => {
    await updateBoardForm.handleSubmit();
  };

  return (
    <updateBoardForm.AppForm>
      <form action={formAction} className="flex flex-col gap-4">
        <AxisFields error={insertAxisMutation.error} form={updateBoardForm} />
        <updateBoardForm.Button type="submit">Insert</updateBoardForm.Button>
      </form>
    </updateBoardForm.AppForm>
  );
};

type UpdateAxisFormProps = {
  onSuccess: () => void;
  axisId: Id<"axis">;
};

const UpdateAxisForm = ({ onSuccess, axisId }: UpdateAxisFormProps) => {
  const updateAxisMutationOptions = useUpdateAxisMutationOptions({
    onSuccess,
  });
  const updateAxisMutation = useMutation(updateAxisMutationOptions);

  const updateBoardForm = useAppForm({
    defaultValues: { name: "" } as AxisFieldsArgs,
    onSubmit: async (data) => {
      await updateAxisMutation.mutateAsync({
        axisId,
        name: data.value.name,
      });
    },
    validators: { onSubmit: AxisFieldsSchema },
  });

  const formAction = async () => {
    await updateBoardForm.handleSubmit();
  };

  return (
    <updateBoardForm.AppForm>
      <form action={formAction} className="flex flex-col gap-4">
        <AxisFields error={updateAxisMutation.error} form={updateBoardForm} />
        <updateBoardForm.Button type="submit">Update</updateBoardForm.Button>
      </form>
    </updateBoardForm.AppForm>
  );
};

type InsertAxisItemPopoverProps = {
  index: number;
  boardId: Id<"boards">;
  orientation: AxisOrientation;
};

export const InsertAxisItemPopover = ({
  orientation,
  boardId,
  index,
}: InsertAxisItemPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSuccess = () => {
    setIsOpen(false);
  };

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger render={<Button variant="outline" />}>
        Insert axis item
      </PopoverTrigger>
      <PopoverPositioner>
        <PopoverContent className="w-80">
          <InsertAxisForm
            boardId={boardId}
            index={index}
            onSuccess={onSuccess}
            orientation={orientation}
          />
        </PopoverContent>
      </PopoverPositioner>
    </Popover>
  );
};

type UpdateAxisItemPopoverProps = {
  axisId: Id<"axis">;
};

export const UpdateAxisItemPopover = ({
  axisId,
}: UpdateAxisItemPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSuccess = () => {
    setIsOpen(false);
  };

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger render={<Button variant="outline" />}>
        Update axis item
      </PopoverTrigger>
      <PopoverPositioner>
        <PopoverContent className="w-80">
          <UpdateAxisForm axisId={axisId} onSuccess={onSuccess} />
        </PopoverContent>
      </PopoverPositioner>
    </Popover>
  );
};

const DeleteAxisSubmit = () => {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? <Spinner /> : null}
      Delete
    </Button>
  );
};

type DeleteAxisFormProps = {
  axisId: Id<"axis">;
};

const DeleteAxisForm = ({ axisId }: DeleteAxisFormProps) => {
  const deleteAxisMutationOptions = useDeleteAxisMutationOptions();
  const deleteAxisMutation = useMutation(deleteAxisMutationOptions);

  const formAction = async () => {
    await deleteAxisMutation.mutateAsync({ axisId });
  };

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <DeleteAxisSubmit />
    </form>
  );
};

type DeleteAxisPopoverProps = {
  axisId: Id<"axis">;
};

export const DeleteAxisPopover = ({ axisId }: DeleteAxisPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        Delete axis item
      </PopoverTrigger>
      <PopoverPositioner>
        <PopoverContent className="w-80">
          <DeleteAxisForm axisId={axisId} />
        </PopoverContent>
      </PopoverPositioner>
    </Popover>
  );
};
