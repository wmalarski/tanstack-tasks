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
  });
};

type UseUpdateBoardMutationOptionsArgs = {
  onSuccess?: () => void;
};

export const useUpdateBoardMutationOptions = ({
  onSuccess,
}: UseUpdateBoardMutationOptionsArgs = {}) => {
  const updateBoardMutationFn = useConvexMutation(api.boards.updateBoard);
  return mutationOptions({
    mutationFn: updateBoardMutationFn,
    onSuccess,
  });
};

type UseInsertTaskMutationOptionsArgs = {
  onSuccess?: () => void;
};

export const useInsertTaskMutationOptions = ({
  onSuccess,
}: UseInsertTaskMutationOptionsArgs = {}) => {
  const insertNodeMutationFn = useConvexMutation(api.tasks.insertTask);
  return mutationOptions({
    mutationFn: insertNodeMutationFn,
    onSuccess,
  });
};

type UseInsertAxisMutationOptionsArgs = {
  onSuccess?: () => void;
};

export const useInsertAxisMutationOptions = ({
  onSuccess,
}: UseInsertAxisMutationOptionsArgs = {}) => {
  const insertAxisMutationFn = useConvexMutation(api.axis.insertAxis);
  return mutationOptions({
    mutationFn: insertAxisMutationFn,
    onSuccess,
  });
};

type UseUpdateAxisMutationOptionsArgs = {
  onSuccess?: () => void;
};

export const useUpdateAxisMutationOptions = ({
  onSuccess,
}: UseUpdateAxisMutationOptionsArgs = {}) => {
  const updateAxisMutationFn = useConvexMutation(api.axis.updateAxis);
  return mutationOptions({
    mutationFn: updateAxisMutationFn,
    onSuccess,
  });
};

type UseDeleteAxisMutationOptionsArgs = {
  onSuccess?: () => void;
};

export const useDeleteAxisMutationOptions = ({
  onSuccess,
}: UseDeleteAxisMutationOptionsArgs = {}) => {
  const deleteAxisMutationFn = useConvexMutation(api.axis.deleteAxis);
  return mutationOptions({
    mutationFn: deleteAxisMutationFn,
    onSuccess,
  });
};

export const useUpdateTasksMutationOptions = () => {
  const updateNodesMutationFn = useConvexMutation(api.tasks.updateTasks);
  return mutationOptions({
    mutationFn: updateNodesMutationFn,
  });
};

export const useUpdateEdgesMutationOptions = () => {
  const updateEdgesMutationFn = useConvexMutation(api.edges.updateEdges);
  return mutationOptions({
    mutationFn: updateEdgesMutationFn,
  });
};
