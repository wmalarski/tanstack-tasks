import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const queryEdges = query({
  args: {
    boardId: v.id("boards"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("edges")
      .filter((q) => q.eq(q.field("board"), args.boardId))
      .collect();
  },
});

export const updateEdges = mutation({
  args: {
    boardId: v.id("boards"),
    insert: v.array(
      v.object({
        source: v.id("nodes"),
        target: v.id("nodes"),
      }),
    ),
    remove: v.array(v.id("edges")),
  },
  handler: async (ctx, args) => {
    return Promise.all([
      ...args.remove.map((edgeId) => ctx.db.delete("edges", edgeId)),
      ...args.insert.map((insert) =>
        ctx.db.insert("edges", {
          board: args.boardId,
          source: insert.source,
          target: insert.target,
        }),
      ),
    ]);
  },
});
