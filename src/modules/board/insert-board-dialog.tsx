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

import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";

import { BoardFields } from "./board-fields";
import { type InsertBoardArgs, InsertBoardSchema } from "./validation";

export const InsertBoardDialog = () => {
  const insertBoardMutationFn = useConvexMutation(api.boards.insertBoard);
  const insertBoardMutation = useMutation({
    mutationFn: insertBoardMutationFn,
  });

  const insertBoardForm = useAppForm({
    defaultValues: {
      description: "",
      title: "",
    } as InsertBoardArgs,
    onSubmit: async (data) => {
      await insertBoardMutation.mutateAsync(data.value);
    },
    validators: {
      onSubmit: InsertBoardSchema,
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
