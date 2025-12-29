import { applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { EdgeSchema, PositionSchema, TaskSchema } from "./schema";

export const queryBoards = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user._id) {
      throw new Error("Not signed in");
    }

    return ctx.db
      .query("boards")
      .filter((q) => q.eq(q.field("user"), user._id))
      .paginate(args.paginationOpts);
  },
});

export const queryBoard = query({
  args: {
    boardId: v.id("boards"),
  },
  handler: async (ctx, args) => {
    const board = await ctx.db.get("boards", args.boardId);

    if (!board) {
      throw new Error("Board not found");
    }

    return board;
  },
});

export const insertBoard = mutation({
  args: {
    description: v.optional(v.string()),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user._id) {
      throw new Error("Not signed in");
    }

    const board = await ctx.db.insert("boards", {
      axisX: [{ id: crypto.randomUUID(), name: "X", size: 300 }],
      axisY: [{ id: crypto.randomUUID(), name: "Y", size: 300 }],
      description: args.description ?? "",
      edges: [],
      tasks: [],
      title: args.title,
      user: user._id,
    });

    const shared = { board, index: 0, size: 300 };

    await Promise.all([
      ctx.db.insert("axis", {
        ...shared,
        name: "X",
        orientation: "horizontal",
      }),
      ctx.db.insert("axis", {
        ...shared,
        name: "Y",
        orientation: "vertical",
      }),
    ]);

    return board;
  },
});

export const updateBoard = mutation({
  args: {
    boardId: v.id("boards"),
    description: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user._id) {
      throw new Error("Not signed in");
    }

    const board = await ctx.db.get("boards", args.boardId);

    if (!board) {
      throw new Error("Board not found");
    }

    return ctx.db.patch("boards", args.boardId, {
      ...board,
      description: args.description ?? board.description,
      title: args.title ?? board.title,
    });
  },
});

export const applyBoardChanges = mutation({
  args: {
    boardId: v.id("boards"),
    edgeChanges: v.array(
      v.union(
        v.object({ id: v.string(), type: v.literal("remove") }),
        v.object({ item: EdgeSchema, type: v.literal("add") }),
      ),
    ),
    nodeChanges: v.array(
      v.union(
        v.object({
          dragging: v.optional(v.boolean()),
          id: v.string(),
          position: v.optional(PositionSchema),
          type: v.literal("position"),
        }),
        v.object({ id: v.string(), type: v.literal("remove") }),
        v.object({
          item: TaskSchema,
          type: v.literal("add"),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const board = await ctx.db.get("boards", args.boardId);

    if (!board) {
      throw new Error("Board not found");
    }

    const updatedEdges = applyEdgeChanges(args.edgeChanges, board.edges);
    const updatedTasks = applyNodeChanges(args.nodeChanges, board.tasks);

    return ctx.db.patch("boards", args.boardId, {
      ...board,
      edges: updatedEdges,
      tasks: updatedTasks,
    });
  },
});
