import {
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  ReactFlow,
} from "@xyflow/react";
import { type ComponentProps, useCallback, useRef, useState } from "react";
import "@xyflow/react/dist/style.css";

import { convexQuery } from "@convex-dev/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";

import { InsertNodeDialog } from "./insert-node-dialog";

type NodeType = ReturnType<typeof mapDocumentsToNodes>[0];
type EdgeType = ReturnType<typeof mapDocumentsToEdges>[0];

type EditorProps = {
  boardId: Id<"boards">;
  nodes: Doc<"nodes">[];
  edges: Doc<"edges">[];
};

export const Editor = ({
  boardId,
  nodes: nodeDocuments,
  edges: edgeDocuments,
}: EditorProps) => {
  const queryClient = useQueryClient();

  const nodes = mapDocumentsToNodes(nodeDocuments);
  const edges = mapDocumentsToEdges(edgeDocuments);

  const [draggingNodes, setDraggingNodes] = useState<{
    nodes: Node<NodeType>[];
    ids: string[];
  }>({ ids: [], nodes: [] });

  const containerRef = useRef<HTMLDivElement>(null);

  const [isInsertNodeOpen, setIsInsertNodeOpen] = useState(false);

  const onNodesChange = useCallback(
    (changes: NodeChange<NodeType>[]) => {
      const changesToApply: NodeChange<NodeType>[] = [];
      const draggingChanges: NodeChange<NodeType>[] = [];

      const nodesQueryOptions = convexQuery(api.nodes.queryNodes, { boardId });

      queryClient.setQueryData(
        nodesQueryOptions.queryKey,
        (docs: Doc<"nodes">[]) => {
          const nodes = mapDocumentsToNodes(docs);
        },
      );

      changes.forEach((change) => {
        switch (change.type) {
          case "add":
          case "replace":
          case "select":
          case "remove":
          case "dimensions":
            break;
          case "position": {
            (change.dragging ? draggingChanges : changesToApply).push(change);
          }
        }
      });

      console.log("[onNodesChange]", changes);
      setDraggingNodes((nodesSnapshot) => {
        return { ids: [], nodes: applyNodeChanges(changes, []) };
      });
    },
    [boardId, queryClient.setQueryData],
  );

  const onEdgesChange = useCallback((changes: EdgeChange<EdgeType>[]) => {
    console.log("[onEdgesChange]", changes);
    // setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot));
  }, []);

  const onConnect = useCallback((params: Connection) => {
    console.log("[onConnect]", params);
    // setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot));
  }, []);

  const onPaneClick: ComponentProps<typeof ReactFlow>["onPaneClick"] = () => {
    setIsInsertNodeOpen((current) => !current);
  };

  return (
    <div ref={containerRef} style={{ height: "100vh", width: "100vw" }}>
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

const mapDocumentsToNodes = (docs: Doc<"nodes">[]) => {
  return docs.map(
    (doc) =>
      ({
        data: {
          axisX: doc.axisX,
          axisY: doc.axisY,
          description: doc.description,
          estimate: doc.estimate,
          label: doc.title,
          link: doc.link,
        },
        id: doc._id,
        position: { x: doc.positionX, y: doc.positionY },
      }) satisfies Node,
  );
};

const mapDocumentsToEdges = (docs: Doc<"edges">[]) => {
  return docs.map(
    (doc) =>
      ({
        id: doc._id,
        source: doc.source,
        target: doc.target,
      }) satisfies Edge,
  );
};
