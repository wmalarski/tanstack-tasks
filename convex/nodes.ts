import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const queryNodes = query({
  args: {
    boardId: v.id("boards"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("nodes")
      .filter((q) => q.eq(q.field("board"), args.boardId))
      .collect();
  },
});

export const insertNode = mutation({
  args: {
    axisX: v.string(),
    axisY: v.number(),
    boardId: v.id("boards"),
    description: v.string(),
    estimate: v.number(),
    link: v.optional(v.string()),
    positionX: v.number(),
    positionY: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("nodes", {
      axisX: args.axisX,
      axisY: args.axisY,
      board: args.boardId,
      description: args.description,
      estimate: args.estimate,
      link: args.link,
      positionX: args.positionX,
      positionY: args.positionY,
      title: args.title,
    });
  },
});

export const updateNode = mutation({
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
