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
    description: v.string(),
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
