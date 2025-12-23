import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  boards: defineTable({
    axis: v.object({
      x: v.array(v.object({ id: v.string(), name: v.string() })),
      y: v.array(v.object({ id: v.string(), name: v.string() })),
    }),
    description: v.string(),
    title: v.string(),
    user: v.id("users"),
  }).index("user", ["user"]),
  edges: defineTable({
    board: v.id("boards"),
    from: v.id("nodes"),
    to: v.id("nodes"),
    user: v.id("users"),
  }).index("board", ["board"]),
  nodes: defineTable({
    board: v.id("boards"),
    description: v.string(),
    estimate: v.number(),
    link: v.string(),
    position: v.object({
      x: v.number(),
      xAxis: v.string(),
      y: v.number(),
      yAxis: v.string(),
    }),
    title: v.string(),
    user: v.id("users"),
  })
    .index("board", ["board"])
    .index("user", ["user"]),
});
