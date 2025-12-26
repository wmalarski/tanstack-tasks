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

import {
  BoardFields,
  type BoardFieldsResult,
  BoardFieldsSchema,
} from "./board-fields";
import { useInsertBoardMutationOptions } from "./services";

export const InsertBoardDialog = () => {
  const insertBoardMutationOptions = useInsertBoardMutationOptions();
  const insertBoardMutation = useMutation(insertBoardMutationOptions);

  const insertBoardForm = useAppForm({
    defaultValues: {
      description: "",
      title: "",
    } as BoardFieldsResult,
    onSubmit: async (data) => {
      try {
        await insertBoardMutation.mutateAsync(data.value);
      } catch {}
    },
    validators: {
      onSubmit: BoardFieldsSchema,
    },
  });

  const formAction = async () => {
    await insertBoardForm.handleSubmit();
  };

  return (
    <Dialog>
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
          <insertBoardForm.AppForm>
            <BoardFields
              error={insertBoardMutation.error}
              form={insertBoardForm}
            />
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <insertBoardForm.Button type="submit">
                Insert
              </insertBoardForm.Button>
            </DialogFooter>
          </insertBoardForm.AppForm>
        </form>
      </DialogContent>
    </Dialog>
  );
};
