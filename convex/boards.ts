import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

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
      axis: { x: [], y: [] },
      description: args.description ?? "",
      title: args.title,
      user: user._id,
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
    console.log("[updateBoard]", args);

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
      axis: args.axis ?? board.axis,
      description: args.description ?? board.description,
      title: args.title ?? board.title,
    });
  },
});
