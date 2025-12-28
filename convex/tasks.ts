import { v } from "convex/values";

import { mutation } from "./_generated/server";

export const insertTask = mutation({
  args: {
    axisX: v.id("axis"),
    axisY: v.id("axis"),
    boardId: v.id("boards"),
    description: v.string(),
    estimate: v.number(),
    link: v.optional(v.string()),
    positionX: v.number(),
    positionY: v.number(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("tasks", {
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

export const updateTasks = mutation({
  args: {
    remove: v.array(v.id("tasks")),
    update: v.array(
      v.object({
        axisX: v.id("axis"),
        axisY: v.id("axis"),
        description: v.optional(v.string()),
        estimate: v.optional(v.number()),
        link: v.optional(v.string()),
        nodeId: v.id("tasks"),
        positionX: v.optional(v.number()),
        positionY: v.optional(v.number()),
        title: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const nodes = await Promise.all(
      args.update.map((node) => ctx.db.get("tasks", node.nodeId)),
    );

    const pairs = nodes.map((node, index) => ({
      node,
      update: args.update[index],
    }));

    await Promise.all([
      ...args.remove.map((nodeId) => ctx.db.delete("tasks", nodeId)),
      ...pairs.map(({ update, node }) =>
        ctx.db.patch("tasks", update.nodeId, {
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
