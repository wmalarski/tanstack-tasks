import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  boards: defineTable({
    axis: v.object({
      x: v.array(v.object({ id: v.string(), name: v.string() })),
      y: v.array(v.object({ id: v.string(), name: v.string() })),
    }),
    description: v.string(),
    title: v.string(),
    user: v.string(),
  }).index("user", ["user"]),
  edges: defineTable({
    board: v.id("boards"),
    from: v.id("nodes"),
    to: v.id("nodes"),
  }).index("board", ["board"]),
  nodes: defineTable({
    axisX: v.string(),
    axisY: v.number(),
    board: v.id("boards"),
    description: v.string(),
    estimate: v.number(),
    link: v.optional(v.string()),
    positionX: v.number(),
    positionY: v.string(),
    title: v.string(),
  }).index("board", ["board"]),
});
