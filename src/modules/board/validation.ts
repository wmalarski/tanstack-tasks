import * as v from "valibot";

export const AxisItemSchema = v.object({
  id: v.string(),
  name: v.string(),
});

export const AxisSchema = v.object({
  x: v.array(AxisItemSchema),
  y: v.array(AxisItemSchema),
});

export type AxisDefinition = v.InferOutput<typeof AxisSchema>;

export const GetBoardsSchema = v.object({
  page: v.number(),
});

export type GetBoardsSchemaArgs = v.InferInput<typeof GetBoardsSchema>;

export const GetBoardSchema = v.object({
  boardId: v.string(),
});

export type GetBoardSchemaArgs = v.InferInput<typeof GetBoardSchema>;

export const InsertBoardSchema = v.object({
  description: v.optional(v.string()),
  title: v.string(),
});

export type InsertBoardArgs = v.InferInput<typeof InsertBoardSchema>;

export const UpdateBoardSchema = v.object({
  axis: v.optional(AxisSchema),
  boardId: v.pipe(v.string(), v.uuid()),
  description: v.optional(v.string()),
  title: v.optional(v.string()),
});

export type UpdateBoardArgs = v.InferInput<typeof UpdateBoardSchema>;
