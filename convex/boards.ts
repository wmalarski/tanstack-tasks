import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const queryBoards = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not signed in");
    }

    return ctx.db
      .query("boards")
      .filter((q) => q.eq(q.field("user"), userId))
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
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not signed in");
    }

    const board = await ctx.db.insert("boards", {
      axis: { x: [], y: [] },
      description: args.description ?? "",
      title: args.title,
      user: userId,
    });

    return board;
  },
});

export const updateBoard = mutation({
  args: {
    axis: v.object({
      x: v.array(v.object({ id: v.string(), name: v.string() })),
      y: v.array(v.object({ id: v.string(), name: v.string() })),
    }),
    boardId: v.id("boards"),
    description: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not signed in");
    }

    const board = await ctx.db.get("boards", args.boardId);

    if (!board) {
      throw new Error("Board not found");
    }

    return ctx.db.patch("boards", args.boardId, {
      axis: args.axis,
      description: args.description,
      title: args.title,
    });
  },
});
