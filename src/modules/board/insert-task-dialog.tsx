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

import { convexQuery } from "@convex-dev/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applyNodeChanges } from "@xyflow/react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { useState } from "react";

import { useApplyBoardChangesMutationOptions } from "./services";
import {
  TASK_FIELDS_DEFAULT,
  TaskFields,
  TaskFieldsSchema,
} from "./task-fields";

type InsertTaskDialogProps = {
  boardId: Id<"boards">;
  axisX: string;
  axisY: string;
};

export const InsertTaskDialog = ({
  axisX,
  axisY,
  boardId,
}: InsertTaskDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = useQueryClient();

  const updateMutation = useMutation(
    useApplyBoardChangesMutationOptions({
      onSuccess: () => {
        insertTaskForm.reset();
        setIsOpen(false);
      },
    }),
  );

  const insertTaskForm = useAppForm({
    defaultValues: TASK_FIELDS_DEFAULT,
    onSubmit: async (data) => {
      const nodeChanges = [
        {
          item: {
            data: {
              axisX,
              axisY,
              description: data.value.description,
              estimate: +data.value.estimate,
              link: data.value.link,
              title: data.value.title,
            },
            id: String(Date.now()),
            position: { x: 0, y: 0 },
          },
          type: "add" as const,
        },
      ];

      const boardQueryKey = convexQuery(api.boards.queryBoard, {
        boardId,
      }).queryKey;

      queryClient.setQueryData(
        boardQueryKey,
        (current: Doc<"boards">): Doc<"boards"> => ({
          ...current,
          tasks: applyNodeChanges(nodeChanges, current.tasks),
        }),
      );

      await updateMutation.mutateAsync({
        boardId,
        edgeChanges: [],
        nodeChanges,
      });
    },
    validators: {
      onSubmit: TaskFieldsSchema,
    },
  });

  const formAction = async () => {
    await insertTaskForm.handleSubmit();
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
          <insertTaskForm.AppForm>
            <TaskFields error={updateMutation.error} form={insertTaskForm} />
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <insertTaskForm.Button type="submit">
                Insert
              </insertTaskForm.Button>
            </DialogFooter>
          </insertTaskForm.AppForm>
        </form>
      </DialogContent>
    </Dialog>
  );
};
