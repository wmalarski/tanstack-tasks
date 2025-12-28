import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppForm } from "@/integrations/tanstack-form";

import { useMutation } from "@tanstack/react-query";
import type { Id } from "convex/_generated/dataModel";
import { useState } from "react";

import {
  NODE_FIELDS_DEFAULT,
  NodeFields,
  NodeFieldsSchema,
} from "./node-fields";
import { useInsertTaskMutationOptions } from "./services";

type InsertTaskDialogProps = {
  boardId: Id<"boards">;
  axisX: Id<"axis">;
  axisY: Id<"axis">;
};

export const InsertTaskDialog = ({
  axisX,
  axisY,
  boardId,
}: InsertTaskDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const insertNodeMutationOptions = useInsertTaskMutationOptions({
    onSuccess: () => setIsOpen(false),
  });

  const insertNodeMutation = useMutation(insertNodeMutationOptions);

  const insertNodeForm = useAppForm({
    defaultValues: NODE_FIELDS_DEFAULT,
    onSubmit: async (data) => {
      await insertNodeMutation.mutateAsync({
        axisX,
        axisY,
        boardId,
        description: data.value.description,
        estimate: Number(data.value.estimate),
        link: data.value.link,
        positionX: 0,
        positionY: 0,
        title: data.value.title,
      });

      insertNodeForm.reset();
    },
    validators: {
      onSubmit: NodeFieldsSchema,
    },
  });

  const formAction = async () => {
    await insertNodeForm.handleSubmit();
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        Open Dialog
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <insertNodeForm.AppForm>
            <NodeFields
              error={insertNodeMutation.error}
              form={insertNodeForm}
            />
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <insertNodeForm.Button type="submit">
                Insert
              </insertNodeForm.Button>
            </DialogFooter>
          </insertNodeForm.AppForm>
        </form>
      </DialogContent>
    </Dialog>
  );
};
