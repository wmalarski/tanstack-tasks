import { protectedMiddleware } from "@/integrations/better-auth/middleware";
import { drizzleMiddleware } from "@/integrations/drizzle/middleware";
import { schema } from "@/integrations/drizzle/schema";

import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import * as v from "valibot";

import { SELECT_BOARDS_DEFAULT_LIMIT } from "./constants";
import {
  type AxisDefinition,
  AxisSchema,
  GetBoardSchema,
  type GetBoardSchemaArgs,
  GetBoardsSchema,
  type GetBoardsSchemaArgs,
  type InsertBoardArgs,
  InsertBoardSchema,
  type UpdateBoardArgs,
  UpdateBoardSchema,
} from "./validation";

const getBoards = createServerFn()
  .inputValidator(GetBoardsSchema)
  .middleware([drizzleMiddleware, protectedMiddleware])
  .handler(async ({ context, data }) => {
    const result = await context.db
      .select()
      .from(schema.board)
      .where(eq(schema.board.userId, context.user.id))
      .limit(SELECT_BOARDS_DEFAULT_LIMIT)
      .offset(SELECT_BOARDS_DEFAULT_LIMIT * data.page);

    return result.flatMap((board) => {
      const parsed = v.safeParse(AxisSchema, board.axis);
      return parsed.success ? [{ ...board, axis: parsed.output }] : [];
    });
  });

export type GetBoardsReturn = Awaited<ReturnType<typeof getBoards>>;
export type GetBoardsReturnItem = GetBoardsReturn[0];

export const getBoardsQueryOptions = (args: GetBoardsSchemaArgs) => {
  return queryOptions({
    queryFn: (context) => {
      const [_key, args] = context.queryKey;
      return getBoards({ data: args, signal: context.signal });
    },
    queryKey: ["getBoards", args] as const,
  });
};

const getBoard = createServerFn()
  .inputValidator(GetBoardSchema)
  .middleware([drizzleMiddleware, protectedMiddleware])
  .handler(async ({ context, data }) => {
    const result = await context.db
      .select()
      .from(schema.board)
      .where(eq(schema.board.id, data.boardId))
      .limit(1);

    const board = result.at(0);

    if (!board) {
      throw notFound();
    }

    const parsed = v.safeParse(AxisSchema, board.axis);

    if (!parsed.success) {
      throw notFound();
    }

    return { ...board, axis: parsed.output };
  });

export type GetBoardReturn = Awaited<ReturnType<typeof getBoard>>;

export const getBoardQueryOptions = (args: GetBoardSchemaArgs) => {
  return queryOptions({
    queryFn: (context) => {
      const [_key, args] = context.queryKey;
      return getBoard({ data: args, signal: context.signal });
    },
    queryKey: ["getBoard", args] as const,
  });
};

const insertBoard = createServerFn({ method: "POST" })
  .inputValidator(InsertBoardSchema)
  .middleware([drizzleMiddleware, protectedMiddleware])
  .handler(async ({ context, data }) => {
    const id = crypto.randomUUID();

    const axis: AxisDefinition = { x: [], y: [] };

    const result = await context.db.insert(schema.board).values({
      ...data,
      axis,
      id,
      userId: context.user.id,
    });

    return result.success;
  });

type InsertBoardMutationOptionsArgs = {
  onSuccess: () => void;
};

export const insertBoardMutationOptions = ({
  onSuccess,
}: InsertBoardMutationOptionsArgs) => {
  return mutationOptions({
    mutationFn: (args: InsertBoardArgs) => {
      return insertBoard({ data: args });
    },
    onSuccess(_data, _variables, _onMutate, context) {
      const options = getBoardsQueryOptions({ page: 0 });

      onSuccess();

      return context.client.invalidateQueries({
        exact: false,
        queryKey: options.queryKey,
      });
    },
  });
};

const updateBoard = createServerFn({ method: "POST" })
  .inputValidator(UpdateBoardSchema)
  .middleware([drizzleMiddleware, protectedMiddleware])
  .handler(async ({ context, data }) => {
    const { boardId, ...update } = data;

    const result = await context.db
      .update(schema.board)
      .set(update)
      .where(eq(schema.board.id, boardId));

    return result.success;
  });

type UpdateBoardMutationOptionsArgs = {
  onSuccess?: () => void;
};

export const updateBoardMutationOptions = ({
  onSuccess,
}: UpdateBoardMutationOptionsArgs = {}) => {
  return mutationOptions({
    mutationFn: (args: UpdateBoardArgs) => {
      return updateBoard({ data: args });
    },
    onSuccess(_data, variables, _onMutate, context) {
      const queryOptions = getBoardQueryOptions({ boardId: variables.boardId });
      context.client.setQueryData(queryOptions.queryKey, (current) =>
        current ? { ...current, ...variables } : undefined,
      );

      onSuccess?.();
    },
  });
};
