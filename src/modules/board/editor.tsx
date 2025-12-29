import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type Node,
  type NodeChange,
  ReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef } from "react";
import "@xyflow/react/dist/style.css";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import {
  mutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import type { NodeResult } from "convex/nodes";

import { AxisNode } from "./axis-node";
import { GroupNode } from "./group-node";
import { TaskNode } from "./task-node";

const nodeTypes = {
  axis: AxisNode,
  default: TaskNode,
  group: GroupNode,
};

type EdgeResult = Doc<"boards">["edges"][0];
type TaskResult = Doc<"boards">["tasks"][0];

// const nodeDefaults: Record<NodeResult["type"], Partial<Node>> = {
//   axis: {
//     connectable: false,
//     deletable: false,
//     draggable: false,
//   },
//   group: {
//     connectable: false,
//     deletable: false,
//     draggable: false,
//   },
//   task: {
//     deletable: false,
//     extent: "parent",
//     zIndex: 100,
//   },
// };

type EditorProps = {
  boardId: Id<"boards">;
  nodes: NodeResult[];
  edges: EdgeResult[];
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

  const staticNodes = useMemo(() => getAxisNodes(board), [board]);

  const nodes = useMemo(
    () => [...staticNodes, ...board.tasks],
    [board.tasks, staticNodes],
  );

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

  return (
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
  );
};

const useThrottledUpdates = () => {
  const mutationFn = useConvexMutation(api.boards.applyBoardChanges);
  const updateMutation = useMutation(mutationOptions({ mutationFn }));

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

// const useThrottledTasksUpdate = (nodes: NodeResult[]) => {
//   const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const changesRef = useRef<NodeChange<NodeResult>[]>([]);

//   const updateTasksMutationOptions = useUpdateTasksMutationOptions();
//   const updateTasksMutation = useMutation(updateTasksMutationOptions);

//   useEffect(() => {
//     return () => {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//     };
//   }, []);

//   return useEffectEvent((updates: NodeChange<NodeResult>[]) => {
//     if (timeoutRef.current || updateTasksMutation.isPending) {
//       changesRef.current.push(...updates);
//       return;
//     }

//     timeoutRef.current = setTimeout(() => {
//       const changes = changesRef.current;
//       timeoutRef.current = null;
//       changesRef.current = [];

//       const removedNodeIds: string[] = [];
//       const changedNodeIds = new Set<string>();

//       changes.forEach((change) => {
//         change.type === "position" && changedNodeIds.add(change.id);
//         change.type === "remove" && removedNodeIds.push(change.id);
//       });

//       const changedNodes = nodes.filter(
//         (node) => changedNodeIds.has(node.id) && node.type === "task",
//       );

//       const applied = applyNodeChanges(changes, changedNodes);

//       if (removedNodeIds.length === 0 && applied.length === 0) {
//         return;
//       }

//       updateTasksMutation.mutate({
//         remove: removedNodeIds as Id<"tasks">[],
//         update: applied.map((node) => ({
//           positionX: node.position.x,
//           positionY: node.position.y,
//           taskId: node.id as Id<"tasks">,
//         })),
//       });
//     }, 1000);
//   });
// };

const DEFAULT_AXIS_SIZE = 200;

const getPositions = (entries: Doc<"boards">["axisX"]) => {
  return entries.reduce(
    (prev, current) => {
      const last = prev[prev.length - 1];
      prev.push(last + current.size);
      return prev;
    },
    [0],
  );
};

type MapAxisToNodesArgs = {
  boardId: Id<"boards">;
  entries: Doc<"boards">["axisX"];
  positions: number[];
  orientation: "vertical" | "horizontal";
};

const mapAxisToNodes = ({
  boardId,
  entries,
  orientation,
  positions,
}: MapAxisToNodesArgs) => {
  return entries.map(
    (axis, index) =>
      ({
        connectable: false,
        data: {
          boardId,
          index,
          label: axis.name,
          orientation,
        },
        deletable: false,
        draggable: false,
        id: axis.id,
        position:
          orientation === "horizontal"
            ? { x: positions[index], y: -DEFAULT_AXIS_SIZE }
            : { x: -DEFAULT_AXIS_SIZE, y: positions[index] },
        style:
          orientation === "horizontal"
            ? { height: DEFAULT_AXIS_SIZE, width: axis.size }
            : { height: axis.size, width: DEFAULT_AXIS_SIZE },
        type: "axis",
      }) satisfies Node,
  );
};

const getParentId = (axisX: string, axisY: string) => {
  return `${axisX}-${axisY}`;
};

type MapAxisToGroupNodesArgs = {
  board: Doc<"boards">;
  horizontalPositions: number[];
  verticalPositions: number[];
};

const mapAxisToGroupNodes = ({
  horizontalPositions,
  verticalPositions,
  board,
}: MapAxisToGroupNodesArgs) => {
  return board.axisX.flatMap((axisX, column) => {
    return board.axisY.map((axisY, row) => {
      return {
        connectable: false,
        data: {
          axisX: axisX.id,
          axisY: axisY.id,
          boardId: board._id,
          label: `H:${axisX.name}-V:${axisY.name}`,
        },
        deletable: false,
        draggable: false,
        id: getParentId(axisX.id, axisY.id),
        position: { x: horizontalPositions[column], y: verticalPositions[row] },
        style: { height: axisY.size, width: axisX.size },
        type: "group" as const,
      } satisfies Node;
    });
  });
};

const getAxisNodes = (board: Doc<"boards">) => {
  console.log("[getAxisNodes]", board);
  const horizontalPositions = getPositions(board.axisX);
  const verticalPositions = getPositions(board.axisY);

  return [
    ...mapAxisToNodes({
      boardId: board._id,
      entries: board.axisX,
      orientation: "horizontal",
      positions: horizontalPositions,
    }),
    ...mapAxisToNodes({
      boardId: board._id,
      entries: board.axisY,
      orientation: "vertical",
      positions: verticalPositions,
    }),
    ...mapAxisToGroupNodes({
      board,
      horizontalPositions,
      verticalPositions,
    }),
  ];
};
