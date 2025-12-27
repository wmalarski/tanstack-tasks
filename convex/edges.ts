import type { Edge } from "@xyflow/react";
import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const queryEdges = query({
  args: {
    boardId: v.id("boards"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("edges")
      .filter((q) => q.eq(q.field("board"), args.boardId))
      .collect();

    return mapDocumentsToEdges(result);
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

export type EdgeResult = ReturnType<typeof mapDocumentsToEdges>[0];
