import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppForm } from "@/integrations/tanstack-form";

import { useMutation } from "@tanstack/react-query";
import type { Id } from "convex/_generated/dataModel";

import {
  NODE_FIELDS_DEFAULT,
  NodeFields,
  NodeFieldsSchema,
} from "./node-fields";
import { useInsertTaskMutationOptions } from "./services";

type InsertNodeDialogProps = {
  isOpen: boolean;
  boardId: Id<"boards">;
  onIsOpenChange: (isOpen: boolean) => void;
};

export const InsertNodeDialog = ({
  isOpen,
  boardId,
  onIsOpenChange,
}: InsertNodeDialogProps) => {
  const insertNodeMutationOptions = useInsertTaskMutationOptions({
    onSuccess: () => onIsOpenChange(false),
  });

  const insertNodeMutation = useMutation(insertNodeMutationOptions);

  const insertNodeForm = useAppForm({
    defaultValues: NODE_FIELDS_DEFAULT,
    onSubmit: async (data) => {
      try {
        await insertNodeMutation.mutateAsync({
          axisX: "",
          axisY: "",
          boardId,
          description: data.value.description,
          estimate: Number(data.value.estimate),
          link: data.value.link,
          positionX: 0,
          positionY: 0,
          title: data.value.title,
        });

        insertNodeForm.reset();
      } catch {}
    },
    validators: {
      onSubmit: NodeFieldsSchema,
    },
  });

  const formAction = async () => {
    await insertNodeForm.handleSubmit();
  };

  return (
    <Dialog onOpenChange={onIsOpenChange} open={isOpen}>
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
