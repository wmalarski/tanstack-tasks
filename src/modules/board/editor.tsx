import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type EdgeChange,
  type Node,
  type NodeChange,
  ReactFlow,
} from "@xyflow/react";
import { type ComponentProps, useCallback, useRef, useState } from "react";
import "@xyflow/react/dist/style.css";

import type { Doc, Id } from "convex/_generated/dataModel";

import { InsertNodeDialog } from "./insert-node-dialog";

const initialNodes: Node[] = [
  { data: { label: "Node 1" }, id: "n1", position: { x: 0, y: 0 } },
  { data: { label: "Node 2" }, id: "n2", position: { x: 0, y: 100 } },
];
const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

type NodeType = (typeof initialNodes)[0];
type EdgeType = (typeof initialEdges)[0];

type EditorProps = {
  boardId: Id<"boards">;
  nodes: Doc<"nodes">[];
  edges: Doc<"edges">[];
};

export const Editor = ({ boardId }: EditorProps) => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const containerRef = useRef<HTMLDivElement>(null);

  const [isInsertNodeOpen, setIsInsertNodeOpen] = useState(false);

  const onNodesChange = useCallback((changes: NodeChange<NodeType>[]) => {
    setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<EdgeType>[]) => {
    setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot));
  }, []);

  const onConnect = useCallback(
    (params: any) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const onDoubleClick: ComponentProps<typeof ReactFlow>["onDoubleClick"] = (
    event,
  ) => {
    if (event.target === containerRef.current) {
      setIsInsertNodeOpen((current) => !current);
    }
  };

  return (
    <div ref={containerRef} style={{ height: "100vh", width: "100vw" }}>
      <ReactFlow
        edges={edges}
        fitView
        nodes={nodes}
        onConnect={onConnect}
        onDoubleClickCapture={onDoubleClick}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
      />
      <InsertNodeDialog
        boardId={boardId}
        isOpen={isInsertNodeOpen}
        onIsOpenChange={setIsInsertNodeOpen}
      />
    </div>
  );
};
