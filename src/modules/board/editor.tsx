import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  ReactFlow,
} from "@xyflow/react";
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import "@xyflow/react/dist/style.css";

import { convexQuery } from "@convex-dev/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import type { EdgeResult } from "convex/edges";
import type { NodeResult } from "convex/nodes";

import { InsertNodeDialog } from "./insert-node-dialog";
import {
  useUpdateEdgesMutationOptions,
  useUpdateNodesMutationOptions,
} from "./services";

type EditorProps = {
  boardId: Id<"boards">;
  nodes: NodeResult[];
  edges: EdgeResult[];
};

export const Editor = ({ boardId, nodes, edges }: EditorProps) => {
  const queryClient = useQueryClient();

  const [isInsertNodeOpen, setIsInsertNodeOpen] = useState(false);

  const throttledUpdate = useThrottledNodesUpdate(nodes);

  const onNodesChange = useCallback(
    (changes: NodeChange<NodeResult>[]) => {
      throttledUpdate(changes);

      const nodesQueryOptions = convexQuery(api.nodes.queryNodes, { boardId });

      queryClient.setQueryData(
        nodesQueryOptions.queryKey,
        (current: NodeResult[]) => applyNodeChanges(changes, current),
      );
    },
    [boardId, queryClient.setQueryData, throttledUpdate],
  );

  const updateEdgesMutationOptions = useUpdateEdgesMutationOptions();
  const updateEdgesMutation = useMutation(updateEdgesMutationOptions);

  const onEdgesChange = useCallback(
    (changes: EdgeChange<EdgeResult>[]) => {
      const edgesQueryOptions = convexQuery(api.edges.queryEdges, { boardId });

      queryClient.setQueryData(
        edgesQueryOptions.queryKey,
        (current: EdgeResult[]) => applyEdgeChanges(changes, current),
      );

      const removedEdgeIds: Id<"edges">[] = [];
      const insertEdgePairs: [Id<"nodes">, Id<"nodes">][] = [];

      changes.forEach((change) => {
        change.type === "remove" &&
          removedEdgeIds.push(change.id as Id<"edges">);
        change.type === "add" &&
          insertEdgePairs.push([
            change.item.source as Id<"nodes">,
            change.item.target as Id<"nodes">,
          ]);
      });

      updateEdgesMutation.mutate({
        boardId,
        insert: insertEdgePairs.map(([source, target]) => ({ source, target })),
        remove: removedEdgeIds,
      });
    },
    [boardId, queryClient.setQueryData, updateEdgesMutation.mutate],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const edgesQueryOptions = convexQuery(api.edges.queryEdges, { boardId });

      queryClient.setQueryData(
        edgesQueryOptions.queryKey,
        (current: EdgeResult[]) => addEdge(params, current),
      );

      updateEdgesMutation.mutate({
        boardId,
        insert: [
          {
            source: params.source as Id<"nodes">,
            target: params.target as Id<"nodes">,
          },
        ],
        remove: [],
      });
    },
    [boardId, queryClient.setQueryData, updateEdgesMutation.mutate],
  );

  const onPaneClick: ComponentProps<typeof ReactFlow>["onPaneClick"] = () => {
    setIsInsertNodeOpen((current) => !current);
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <ReactFlow
        edges={edges}
        fitView
        nodes={nodes}
        onConnect={onConnect}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        onPaneClick={onPaneClick}
      />
      <InsertNodeDialog
        boardId={boardId}
        isOpen={isInsertNodeOpen}
        onIsOpenChange={setIsInsertNodeOpen}
      />
    </div>
  );
};

const useThrottledNodesUpdate = (nodes: NodeResult[]) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const changesRef = useRef<NodeChange<NodeResult>[]>([]);

  const updateNodesMutationOptions = useUpdateNodesMutationOptions();
  const updateNodesMutation = useMutation(updateNodesMutationOptions);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useEffectEvent((updates: NodeChange<NodeResult>[]) => {
    if (timeoutRef.current || updateNodesMutation.isPending) {
      changesRef.current.push(...updates);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      const changes = changesRef.current;
      timeoutRef.current = null;
      changesRef.current = [];

      const removedNodeIds: string[] = [];
      const changedNodeIds = new Set<string>();

      changes.forEach((change) => {
        change.type === "position" && changedNodeIds.add(change.id);
        change.type === "remove" && removedNodeIds.push(change.id);
      });

      const changedNodes = nodes.filter((node) => changedNodeIds.has(node.id));

      const applied = applyNodeChanges(changes, changedNodes);

      if (removedNodeIds.length === 0 && applied.length === 0) {
        return;
      }

      updateNodesMutation.mutate({
        remove: removedNodeIds as Id<"nodes">[],
        update: applied.map((node) => ({
          nodeId: node.id,
          positionX: node.position.x,
          positionY: node.position.y,
        })),
      });
    }, 1000);
  });
};
