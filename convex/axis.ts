import { v } from "convex/values";

import { mutation } from "./_generated/server";

export const insertAxis = mutation({
  args: {
    boardId: v.id("boards"),
    index: v.number(),
    name: v.string(),
    orientation: v.union(v.literal("vertical"), v.literal("horizontal")),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("axis", {
      board: args.boardId,
      index: args.index,
      name: args.name,
      orientation: args.orientation,
      size: 100,
    });
  },
});

export const updateAxis = mutation({
  args: {
    axisId: v.id("axis"),
    name: v.optional(v.string()),
    size: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const axis = await ctx.db.get("axis", args.axisId);

    if (!axis) {
      throw new Error("Axis not found");
    }

    return ctx.db.patch("axis", args.axisId, {
      ...axis,
      name: args.name ?? axis.name,
      size: args.size ?? axis.size,
    });
  },
});

export const deleteAxis = mutation({
  args: {
    axisId: v.id("axis"),
  },
  handler: async (ctx, args) => {
    return ctx.db.delete("axis", args.axisId);
  },
});
