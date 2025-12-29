import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  axis: defineTable({
    board: v.id("boards"),
    index: v.number(),
    name: v.string(),
    orientation: v.union(v.literal("vertical"), v.literal("horizontal")),
    size: v.number(),
  }).index("board", ["board"]),
  boards: defineTable({
    axisX: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        size: v.number(),
      }),
    ),
    axisY: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        size: v.number(),
      }),
    ),
    description: v.string(),
    edges: v.array(
      v.object({
        id: v.string(),
        source: v.string(),
        target: v.string(),
      }),
    ),
    tasks: v.array(
      v.object({
        data: v.object({
          axisX: v.string(),
          axisY: v.string(),
          description: v.string(),
          estimate: v.number(),
          link: v.optional(v.string()),
          title: v.string(),
        }),
        id: v.string(),
        position: v.object({
          x: v.number(),
          y: v.number(),
        }),
      }),
    ),
    title: v.string(),
    user: v.string(),
  }).index("user", ["user"]),
  edges: defineTable({
    board: v.id("boards"),
    source: v.id("tasks"),
    target: v.id("tasks"),
  }).index("board", ["board"]),
  tasks: defineTable({
    axisX: v.id("axis"),
    axisY: v.id("axis"),
    board: v.id("boards"),
    description: v.string(),
    estimate: v.number(),
    link: v.optional(v.string()),
    positionX: v.number(),
    positionY: v.number(),
    title: v.string(),
  }).index("board", ["board"]),
});
