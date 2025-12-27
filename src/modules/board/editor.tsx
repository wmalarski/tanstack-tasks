import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  ReactFlow,
} from "@xyflow/react";
import { type ComponentProps, useCallback, useState } from "react";
import "@xyflow/react/dist/style.css";

import { convexQuery } from "@convex-dev/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import type { EdgeResult } from "convex/edges";
import type { NodeResult } from "convex/nodes";

import { InsertNodeDialog } from "./insert-node-dialog";

type EditorProps = {
  boardId: Id<"boards">;
  nodes: NodeResult[];
  edges: EdgeResult[];
};

export const Editor = ({ boardId, nodes, edges }: EditorProps) => {
  const queryClient = useQueryClient();

  const [isInsertNodeOpen, setIsInsertNodeOpen] = useState(false);

  const onNodesChange = useCallback(
    (changes: NodeChange<NodeResult>[]) => {
      const nodesQueryOptions = convexQuery(api.nodes.queryNodes, { boardId });

      queryClient.setQueryData(
        nodesQueryOptions.queryKey,
        (current: NodeResult[]) => applyNodeChanges(changes, current),
      );

      console.log("[onNodesChange]", changes);
    },
    [boardId, queryClient.setQueryData],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<EdgeResult>[]) => {
      const nodesQueryOptions = convexQuery(api.edges.queryEdges, { boardId });

      queryClient.setQueryData(
        nodesQueryOptions.queryKey,
        (current: EdgeResult[]) => applyEdgeChanges(changes, current),
      );

      console.log("[onEdgesChange]", changes);
    },
    [boardId, queryClient.setQueryData],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const nodesQueryOptions = convexQuery(api.edges.queryEdges, { boardId });

      queryClient.setQueryData(
        nodesQueryOptions.queryKey,
        (current: EdgeResult[]) => addEdge(params, current),
      );

      console.log("[onConnect]", params);
      // setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot));
    },
    [boardId, queryClient.setQueryData],
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
