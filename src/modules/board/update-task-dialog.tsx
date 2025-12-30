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
import { applyNodeChanges, useStoreApi } from "@xyflow/react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { useState } from "react";

import {
  NODE_FIELDS_DEFAULT,
  NodeFields,
  NodeFieldsSchema,
} from "./node-fields";
import type { NodeResult } from "./node-utils";
import { useApplyBoardChangesMutationOptions } from "./services";

type UpdateTaskDialogProps = {
  boardId: Id<"boards">;
  taskId: string;
};

export const UpdateTaskDialog = ({
  boardId,
  taskId,
}: UpdateTaskDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const store = useStoreApi();

  const queryClient = useQueryClient();

  const updateMutation = useMutation(
    useApplyBoardChangesMutationOptions({
      onSuccess: () => {
        updateTaskForm.reset();
        setIsOpen(false);
      },
    }),
  );

  const updateTaskForm = useAppForm({
    defaultValues: NODE_FIELDS_DEFAULT,
    onSubmit: async (data) => {
      const task = store
        .getState()
        .nodes.find((node) => node.id === taskId) as NodeResult;

      if (!task || "type" in task) {
        return;
      }

      const nodeChanges = [
        {
          id: taskId,
          item: {
            ...task,
            data: {
              ...task.data,
              description: data.value.description,
              estimate: +data.value.estimate,
              link: data.value.link,
              title: data.value.title,
            },
          },
          type: "replace" as const,
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
      onSubmit: NodeFieldsSchema,
    },
  });

  const formAction = async () => {
    await updateTaskForm.handleSubmit();
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
          <updateTaskForm.AppForm>
            <NodeFields error={updateMutation.error} form={updateTaskForm} />
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <updateTaskForm.Button type="submit">Save</updateTaskForm.Button>
            </DialogFooter>
          </updateTaskForm.AppForm>
        </form>
      </DialogContent>
    </Dialog>
  );
};
