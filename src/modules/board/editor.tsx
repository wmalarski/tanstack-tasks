import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  ReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef } from "react";
import "@xyflow/react/dist/style.css";

import { convexQuery } from "@convex-dev/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";

import { AxisNode } from "./axis-node";
import { BoardContextProvider } from "./board-context";
import { GroupNode } from "./group-node";
import { type TaskResult, useBoardNodes } from "./node-utils";
import { useApplyBoardChangesMutationOptions } from "./services";
import { TaskNode } from "./task-node";

const nodeTypes = {
  axis: AxisNode,
  default: TaskNode,
  group: GroupNode,
};

type EdgeResult = Doc<"boards">["edges"][0];

type EditorProps = {
  board: Doc<"boards">;
};

export const Editor = ({ board }: EditorProps) => {
  const queryClient = useQueryClient();

  const throttledUpdate = useThrottledUpdates();

  const boardId = board._id;

  const boardQueryKey = useMemo(
    () => convexQuery(api.boards.queryBoard, { boardId }).queryKey,
    [boardId],
  );

  const nodes = useBoardNodes(board);

  const onNodesChange = useCallback(
    (changes: NodeChange<(typeof nodes)[0]>[]) => {
      const typedChanges = changes as NodeChange<TaskResult>[];
      const sync: Parameters<typeof throttledUpdate>[0]["nodeChanges"] = [];

      typedChanges.forEach((change) => {
        change.type === "remove" && sync.push(change);
        change.type === "position" &&
          change.dragging === false &&
          sync.push({ ...change, dragging: undefined });
      });

      throttledUpdate({ boardId, edgeChanges: [], nodeChanges: sync });

      queryClient.setQueryData(
        boardQueryKey,
        (current: Doc<"boards">): Doc<"boards"> => ({
          ...current,
          tasks: applyNodeChanges(typedChanges, current.tasks),
        }),
      );
    },
    [boardId, throttledUpdate, boardQueryKey, queryClient.setQueryData],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<EdgeResult>[]) => {
      const sync: Parameters<typeof throttledUpdate>[0]["edgeChanges"] = [];

      changes.forEach((change) => {
        change.type === "add" ||
          (change.type === "remove" && sync.push(change));
      });

      throttledUpdate({ boardId, edgeChanges: sync, nodeChanges: [] });

      queryClient.setQueryData(
        boardQueryKey,
        (current: Doc<"boards">): Doc<"boards"> => ({
          ...current,
          edges: applyEdgeChanges(changes, current.edges),
        }),
      );
    },
    [boardId, throttledUpdate, boardQueryKey, queryClient.setQueryData],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const edgeId = String(Date.now());
      const item = { id: edgeId, source: params.source, target: params.target };
      const sync = [{ item, type: "add" as const }];

      throttledUpdate({ boardId, edgeChanges: sync, nodeChanges: [] });

      queryClient.setQueryData(
        boardQueryKey,
        (current: Doc<"boards">): Doc<"boards"> => ({
          ...current,
          edges: addEdge(params, current.edges),
        }),
      );
    },
    [throttledUpdate, boardQueryKey, boardId, queryClient.setQueryData],
  );

  return (
    <BoardContextProvider boardId={boardId}>
      <div style={{ height: "100vh", width: "100vw" }}>
        <ReactFlow
          edges={board.edges}
          fitView
          nodes={nodes}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          onEdgesChange={onEdgesChange}
          onNodesChange={onNodesChange}
        />
      </div>
    </BoardContextProvider>
  );
};

const useThrottledUpdates = () => {
  const updateMutation = useMutation(useApplyBoardChangesMutationOptions());

  type Arguments = Parameters<typeof updateMutation.mutate>[0];

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callHistoryRef = useRef<Arguments[]>([]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useEffectEvent((args: Arguments) => {
    if (timeoutRef.current || updateMutation.isPending) {
      callHistoryRef.current.push(args);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      const callHistory = callHistoryRef.current;
      timeoutRef.current = null;
      callHistoryRef.current = [];

      const aggregated = callHistory.reduce(
        (previous, current) => {
          previous.edgeChanges.push(...current.edgeChanges);
          previous.nodeChanges.push(...current.nodeChanges);
          return previous;
        },
        {
          boardId: args.boardId,
          edgeChanges: [],
          nodeChanges: [],
        },
      );

      if (
        aggregated.edgeChanges.length === 0 &&
        aggregated.nodeChanges.length === 0
      ) {
        return;
      }

      updateMutation.mutate(aggregated);
    }, 1000);
  });
};

// const combainedNodes = useMemo(() => {
//   return [
//     {
//       id: "A",
//       position: { x: 0, y: 0 },
//       style: {
//         height: 240,
//         width: 270,
//       },
//       type: "group",
//     },
//     {
//       data: { label: "Child Node 1" },
//       extent: "parent",
//       id: "A-1",
//       parentId: "A",
//       position: { x: 10, y: 10 },
//       type: "input",
//     },
//     {
//       data: { label: "Child Node 2" },
//       extent: "parent",
//       id: "A-2",
//       parentId: "A",
//       position: { x: 10, y: 120 },
//     },
//     {
//       data: { label: "Node B" },
//       id: "B",
//       position: { x: -150, y: 250 },
//       type: "output",
//     },
//     {
//       data: { label: "Node C" },
//       id: "C",
//       position: { x: 150, y: 250 },
//       type: "output",
//     },
//   ];
// }, [nodes]);

// const updatedNodes = useMemo(() => {
//   return nodes.map((node) => ({ ...nodeDefaults[node.type], ...node }));
// }, [nodes.map]);
