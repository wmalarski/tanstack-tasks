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

import type { AxisOrientation } from "./node-utils";
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

const getAxisKey = (orientation: AxisOrientation) => {
  const isHorizontal = orientation === "horizontal";
  return isHorizontal ? ("axisX" as const) : ("axisY" as const);
};

const getAxisCopy = (
  board: Doc<"boards">,
  key: ReturnType<typeof getAxisKey>,
) => {
  return [...board[key]];
};

const getAxisIndex = (axis: ReturnType<typeof getAxisCopy>, axisId: string) => {
  return axis.findIndex((entry) => entry.id === axisId);
};

const getAxisMutationData = (
  orientation: AxisOrientation,
  board: Doc<"boards">,
  axisId: string,
) => {
  const key = getAxisKey(orientation);
  const axisCopy = getAxisCopy(board, key);
  const index = getAxisIndex(axisCopy, axisId);

  return { axisCopy, index, key };
};

type InsertAxisFormProps = {
  axisId: string;
  board: Doc<"boards">;
  orientation: AxisOrientation;
  onSuccess: () => void;
};

const InsertAxisForm = ({
  axisId,
  orientation,
  board,
  onSuccess,
}: InsertAxisFormProps) => {
  const updateBoardMutation = useMutation(
    useUpdateBoardMutationOptions({ onSuccess }),
  );

  const updateBoardForm = useAppForm({
    defaultValues: { name: "" } as AxisFieldsArgs,
    onSubmit: async (data) => {
      const { axisCopy, index, key } = getAxisMutationData(
        orientation,
        board,
        axisId,
      );

      axisCopy.splice(index + 1, 0, {
        id: String(Date.now()),
        name: data.value.name,
        size: 300,
      });

      await updateBoardMutation.mutateAsync({
        boardId: board._id,
        [key]: axisCopy,
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
        <AxisFields error={updateBoardMutation.error} form={updateBoardForm} />
        <updateBoardForm.Button type="submit">Insert</updateBoardForm.Button>
      </form>
    </updateBoardForm.AppForm>
  );
};

type UpdateAxisFormProps = {
  onSuccess: () => void;
  axisId: string;
  board: Doc<"boards">;
  orientation: AxisOrientation;
};

const UpdateAxisForm = ({
  onSuccess,
  axisId,
  board,
  orientation,
}: UpdateAxisFormProps) => {
  const updateBoardMutation = useMutation(
    useUpdateBoardMutationOptions({ onSuccess }),
  );

  const { axisCopy, index, key } = getAxisMutationData(
    orientation,
    board,
    axisId,
  );

  const currentEntry = axisCopy[index];

  const updateBoardForm = useAppForm({
    defaultValues: { name: currentEntry.name } as AxisFieldsArgs,
    onSubmit: async (data) => {
      axisCopy.splice(index, 1, {
        ...currentEntry,
        name: data.value.name,
      });

      await updateBoardMutation.mutateAsync({
        boardId: board._id,
        [key]: axisCopy,
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
        <AxisFields error={updateBoardMutation.error} form={updateBoardForm} />
        <updateBoardForm.Button type="submit">Update</updateBoardForm.Button>
      </form>
    </updateBoardForm.AppForm>
  );
};

type InsertAxisItemPopoverProps = {
  axisId: string;
  board: Doc<"boards">;
  orientation: AxisOrientation;
};

export const InsertAxisItemPopover = ({
  orientation,
  board,
  axisId,
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
            axisId={axisId}
            board={board}
            onSuccess={onSuccess}
            orientation={orientation}
          />
        </PopoverContent>
      </PopoverPositioner>
    </Popover>
  );
};

type UpdateAxisItemPopoverProps = {
  axisId: string;
  board: Doc<"boards">;
  orientation: AxisOrientation;
};

export const UpdateAxisItemPopover = ({
  board,
  axisId,
  orientation,
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
            axisId={axisId}
            board={board}
            onSuccess={onSuccess}
            orientation={orientation}
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
  board: Doc<"boards">;
  axisId: string;
  orientation: AxisOrientation;
};

const DeleteAxisForm = ({
  board,
  axisId,
  orientation,
}: DeleteAxisFormProps) => {
  const updateBoardMutation = useMutation(useUpdateBoardMutationOptions());

  const formAction = async () => {
    const { axisCopy, index, key } = getAxisMutationData(
      orientation,
      board,
      axisId,
    );

    axisCopy.splice(index, 1);

    await updateBoardMutation.mutateAsync({
      boardId: board._id,
      [key]: axisCopy,
    });
  };

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <DeleteAxisSubmit />
    </form>
  );
};

type DeleteAxisPopoverProps = {
  board: Doc<"boards">;
  axisId: string;
  orientation: AxisOrientation;
};

export const DeleteAxisPopover = ({
  board,
  axisId,
  orientation,
}: DeleteAxisPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        Delete axis item
      </PopoverTrigger>
      <PopoverPositioner>
        <PopoverContent className="w-80">
          <DeleteAxisForm
            axisId={axisId}
            board={board}
            orientation={orientation}
          />
        </PopoverContent>
      </PopoverPositioner>
    </Popover>
  );
};
