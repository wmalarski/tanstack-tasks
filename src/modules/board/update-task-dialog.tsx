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

import type { NodeResult, TaskResult } from "./node-utils";
import { useApplyBoardChangesMutationOptions } from "./services";
import {
  TaskFields,
  type TaskFieldsResult,
  TaskFieldsSchema,
} from "./task-fields";

type UpdateTaskDialogProps = {
  boardId: Id<"boards">;
  taskId: string;
  taskData: TaskResult["data"];
};

export const UpdateTaskDialog = ({
  boardId,
  taskId,
  taskData,
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
    defaultValues: {
      description: taskData.description,
      estimate: String(taskData.estimate),
      link: taskData.link,
      title: taskData.title,
    } as TaskFieldsResult,
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
            data: {
              ...task.data,
              description: data.value.description,
              estimate: +data.value.estimate,
              link: data.value.link,
              title: data.value.title,
            },
            id: taskId,
            position: task.position,
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
      onSubmit: TaskFieldsSchema,
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
            <TaskFields error={updateMutation.error} form={updateTaskForm} />
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
