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

type UseInsertNodeMutationOptionsArgs = {
  onSuccess?: () => void;
};

export const useInsertNodeMutationOptions = ({
  onSuccess,
}: UseInsertNodeMutationOptionsArgs = {}) => {
  const insertNodeMutationFn = useConvexMutation(api.nodes.insertNode);
  return mutationOptions({
    mutationFn: insertNodeMutationFn,
    onSuccess,
  });
};

export const useUpdateNodesMutationOptions = () => {
  const updateNodesMutationFn = useConvexMutation(api.nodes.updateNodes);
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
