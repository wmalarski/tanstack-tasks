import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const queryBoards = query({
  args: { paginationOpts: paginationOptsValidator },
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
  args: { boardId: v.id("boards") },
  handler: (ctx, args) => {
    return ctx.db
      .query("boards")
      .filter((q) => q.eq(q.field("_id"), args.boardId))
      .first();
  },
});

export const insertBoard = mutation({
  args: { description: v.string(), title: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not signed in");
    }

    const board = await ctx.db.insert("boards", {
      axis: { x: [], y: [] },
      description: args.description,
      title: args.title,
      user: userId,
    });

    return board;
  },
});
