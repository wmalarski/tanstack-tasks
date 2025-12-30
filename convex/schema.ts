import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const PositionSchema = v.object({
  x: v.number(),
  y: v.number(),
});

export const TaskSchema = v.object({
  data: v.object({
    axisX: v.string(),
    axisY: v.string(),
    description: v.string(),
    estimate: v.number(),
    link: v.optional(v.string()),
    title: v.string(),
  }),
  id: v.string(),
  position: PositionSchema,
});

export const EdgeSchema = v.object({
  id: v.string(),
  source: v.string(),
  target: v.string(),
});

export const AxisSchema = v.object({
  id: v.string(),
  name: v.string(),
  size: v.number(),
});

export default defineSchema({
  boards: defineTable({
    axisX: v.array(AxisSchema),
    axisY: v.array(AxisSchema),
    description: v.string(),
    edges: v.array(EdgeSchema),
    tasks: v.array(TaskSchema),
    title: v.string(),
    user: v.string(),
  }).index("user", ["user"]),
});
