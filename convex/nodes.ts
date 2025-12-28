import type { Node } from "@xyflow/react";
import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const queryNodes = query({
  args: {
    boardId: v.id("boards"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("nodes")
      .filter((q) => q.eq(q.field("board"), args.boardId))
      .collect();

    return mapDocumentsToNodes(result);
  },
});

export const insertNode = mutation({
  args: {
    axisX: v.string(),
    axisY: v.string(),
    boardId: v.id("boards"),
    description: v.string(),
    estimate: v.number(),
    link: v.optional(v.string()),
    positionX: v.number(),
    positionY: v.number(),
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
        axisY: v.optional(v.string()),
        description: v.optional(v.string()),
        estimate: v.optional(v.number()),
        link: v.optional(v.string()),
        nodeId: v.id("nodes"),
        positionX: v.optional(v.number()),
        positionY: v.optional(v.number()),
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

    await Promise.all([
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

const mapDocumentsToNodes = (docs: Doc<"nodes">[]) => {
  return docs.map(
    (doc) =>
      ({
        data: {
          axisX: doc.axisX,
          axisY: doc.axisY,
          description: doc.description,
          estimate: doc.estimate,
          label: doc.title,
          link: doc.link,
        },
        id: doc._id,
        position: { x: doc.positionX, y: doc.positionY },
      }) satisfies Node,
  );
};

export type NodeResult = ReturnType<typeof mapDocumentsToNodes>[0];
