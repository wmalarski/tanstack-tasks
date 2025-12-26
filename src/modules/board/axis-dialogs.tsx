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
import type { Doc } from "convex/_generated/dataModel";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import * as v from "valibot";

import { useUpdateBoardMutationOptions } from "./services";

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
  board: Doc<"boards">;
  axisKey: keyof Doc<"boards">["axis"];
  onSuccess: () => void;
};

const InsertAxisForm = ({
  index,
  board,
  axisKey,
  onSuccess,
}: InsertAxisFormProps) => {
  const updateBoardMutationOptions = useUpdateBoardMutationOptions({
    onSuccess,
  });
  const updateBoardMutation = useMutation(updateBoardMutationOptions);

  const updateBoardForm = useAppForm({
    defaultValues: { name: "" } as AxisFieldsArgs,
    onSubmit: async (data) => {
      const copy = [...board.axis[axisKey]];
      copy.splice(index, 0, {
        id: String(Date.now()),
        name: data.value.name,
      });

      try {
        await updateBoardMutation.mutateAsync({
          axis: { ...board.axis, [axisKey]: copy },
          boardId: board._id,
        });
      } catch {}
    },
    validators: { onSubmit: AxisFieldsSchema },
  });

  const formAction = async () => {
    await updateBoardForm.handleSubmit();
  };

  return (
    <updateBoardForm.AppForm>
      <form action={formAction} className="flex flex-col gap-4">
        <AxisFields error={updateBoardMutation.error} form={updateBoardForm} />
        <updateBoardForm.Button type="submit">Insert</updateBoardForm.Button>
      </form>
    </updateBoardForm.AppForm>
  );
};

type UpdateAxisFormProps = {
  index: number;
  board: Doc<"boards">;
  axisKey: keyof Doc<"boards">["axis"];
  onSuccess: () => void;
};

const UpdateAxisForm = ({
  index,
  board,
  axisKey,
  onSuccess,
}: UpdateAxisFormProps) => {
  const updateBoardMutationOptions = useUpdateBoardMutationOptions({
    onSuccess,
  });
  const updateBoardMutation = useMutation(updateBoardMutationOptions);

  const updateBoardForm = useAppForm({
    defaultValues: { name: "" } as AxisFieldsArgs,
    onSubmit: async (data) => {
      const copy = [...board.axis[axisKey]];
      copy.splice(index, 1, {
        id: copy[index].id,
        name: data.value.name,
      });

      try {
        await updateBoardMutation.mutateAsync({
          axis: { ...board.axis, [axisKey]: copy },
          boardId: board._id,
        });
      } catch {}
    },
    validators: { onSubmit: AxisFieldsSchema },
  });

  const formAction = async () => {
    await updateBoardForm.handleSubmit();
  };

  return (
    <updateBoardForm.AppForm>
      <form action={formAction} className="flex flex-col gap-4">
        <AxisFields error={updateBoardMutation.error} form={updateBoardForm} />
        <updateBoardForm.Button type="submit">Update</updateBoardForm.Button>
      </form>
    </updateBoardForm.AppForm>
  );
};

type InsertAxisItemPopoverProps = {
  index: number;
  board: Doc<"boards">;
  axisKey: keyof Doc<"boards">["axis"];
};

export const InsertAxisItemPopover = ({
  axisKey,
  board,
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
            axisKey={axisKey}
            board={board}
            index={index}
            onSuccess={onSuccess}
          />
        </PopoverContent>
      </PopoverPositioner>
    </Popover>
  );
};

type UpdateAxisItemPopoverProps = {
  index: number;
  board: Doc<"boards">;
  axisKey: keyof Doc<"boards">["axis"];
};

export const UpdateAxisItemPopover = ({
  axisKey,
  board,
  index,
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
          <UpdateAxisForm
            axisKey={axisKey}
            board={board}
            index={index}
            onSuccess={onSuccess}
          />
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
  index: number;
  board: Doc<"boards">;
  axisKey: keyof Doc<"boards">["axis"];
};

const DeleteAxisForm = ({ index, board, axisKey }: DeleteAxisFormProps) => {
  const updateBoardMutationOptions = useUpdateBoardMutationOptions();
  const updateBoardMutation = useMutation(updateBoardMutationOptions);

  const formAction = async () => {
    const copy = [...board.axis[axisKey]];
    copy.splice(index, 1);

    try {
      await updateBoardMutation.mutateAsync({
        axis: { ...board.axis, [axisKey]: copy },
        boardId: board._id,
      });
    } catch {}
  };

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <DeleteAxisSubmit />
    </form>
  );
};

type DeleteAxisPopoverProps = {
  index: number;
  board: Doc<"boards">;
  axisKey: keyof Doc<"boards">["axis"];
};

export const DeleteAxisPopover = ({
  axisKey,
  board,
  index,
}: DeleteAxisPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        Delete axis item
      </PopoverTrigger>
      <PopoverPositioner>
        <PopoverContent className="w-80">
          <DeleteAxisForm axisKey={axisKey} board={board} index={index} />
        </PopoverContent>
      </PopoverPositioner>
    </Popover>
  );
};
