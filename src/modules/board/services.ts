import { useConvexMutation } from "@convex-dev/react-query";
import { mutationOptions } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";

export const useInsertBoardMutationOptions = () => {
  const navigate = useNavigate();

  const insertBoardMutationFn = useConvexMutation(api.boards.insertBoard);
  return mutationOptions({
    mutationFn: insertBoardMutationFn,
    onSuccess: async (data) => {
      await navigate({ params: { boardId: data }, to: "/board/$boardId" });
    },
    throwOnError: false,
  });
};

type UseUpdateBoardMutationOptionsArgs = {
  onSuccess?: () => void;
};

export const useUpdateBoardMutationOptions = ({
  onSuccess,
}: UseUpdateBoardMutationOptionsArgs = {}) => {
  return mutationOptions({
    mutationFn: useConvexMutation(api.boards.updateBoard),
    onSuccess,
    throwOnError: false,
  });
};

type UseApplyBoardChangesMutationOptionsArgs = {
  onSuccess?: () => void;
};

export const useApplyBoardChangesMutationOptions = ({
  onSuccess,
}: UseApplyBoardChangesMutationOptionsArgs = {}) => {
  return mutationOptions({
    mutationFn: useConvexMutation(api.boards.applyBoardChanges),
    onSuccess,
    throwOnError: false,
  });
};
