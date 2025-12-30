import type { Id } from "convex/_generated/dataModel";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from "react";

type BoardContextValues = {
  boardId: Id<"boards">;
};

const BoardContext = createContext<BoardContextValues | null>(null);

type BoardContextProviderProps = PropsWithChildren<{
  boardId: Id<"boards">;
}>;

export const BoardContextProvider = ({
  boardId,
  children,
}: BoardContextProviderProps) => {
  const value = useMemo(() => ({ boardId }), [boardId]);
  return <BoardContext value={value}>{children}</BoardContext>;
};

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("BoardContextProvider is not defined");
  }
  return context;
};
