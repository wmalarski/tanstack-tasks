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

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import {
  mutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { applyNodeChanges } from "@xyflow/react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
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

  const queryClient = useQueryClient();

  // const store = useStore((state) => state.nodes)
  const mutationFn = useConvexMutation(api.boards.applyBoardChanges);
  const updateMutation = useMutation(
    mutationOptions({ mutationFn, throwOnError: false }),
  );

  const insertNodeMutationOptions = useInsertTaskMutationOptions({
    onSuccess: () => setIsOpen(false),
  });

  const insertNodeMutation = useMutation(insertNodeMutationOptions);

  const insertNodeForm = useAppForm({
    defaultValues: NODE_FIELDS_DEFAULT,
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
