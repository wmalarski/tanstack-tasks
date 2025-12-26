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

import {
  NODE_FIELDS_DEFAULT,
  NodeFields,
  NodeFieldsSchema,
} from "./node-fields";

type InsertNodeDialogProps = {
  isOpen: boolean;
  onIsOpenChange: (isOpen: boolean) => void;
};

export const InsertNodeDialog = ({
  isOpen,
  onIsOpenChange,
}: InsertNodeDialogProps) => {
  //   const insertBoardMutationOptions = useInsertBoardMutationOptions();
  //   const insertBoardMutation = useMutation(insertBoardMutationOptions);

  const insertNodeForm = useAppForm({
    defaultValues: NODE_FIELDS_DEFAULT,
    onSubmit: async (data) => {
      console.log("[data]", data);
      //   try {
      //     await insertBoardMutation.mutateAsync(data.value);
      //   } catch {}
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
              //   error={insertBoardMutation.error}
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
