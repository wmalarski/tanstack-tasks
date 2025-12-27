import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

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

export const updateNodes = mutation({
  args: {
    remove: v.array(v.id("nodes")),
    update: v.array(
      v.object({
        axisX: v.optional(v.string()),
        axisY: v.optional(v.number()),
        description: v.optional(v.string()),
        estimate: v.optional(v.number()),
        link: v.optional(v.string()),
        nodeId: v.id("nodes"),
        positionX: v.optional(v.number()),
        positionY: v.optional(v.string()),
        title: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const nodes = await Promise.all(
      args.update.map((node) => ctx.db.get("nodes", node.nodeId)),
    );

    const pairs = nodes.map((node, index) => ({
      node,
      update: args.update[index],
    }));

    return Promise.all([
      ...args.remove.map((nodeId) => ctx.db.delete("nodes", nodeId)),
      ...pairs.map(({ update, node }) =>
        ctx.db.patch("nodes", update.nodeId, {
          axisX: update.axisX ?? node?.axisX,
          axisY: update.axisY ?? node?.axisY,
          description: update.description ?? node?.description,
          estimate: update.estimate ?? node?.estimate,
          link: update.link ?? node?.link,
          positionX: update.positionX ?? node?.positionX,
          positionY: update.positionY ?? node?.positionY,
          title: update.title ?? node?.title,
        }),
      ),
    ]);
  },
});
