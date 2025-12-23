import { useSuspenseQuery } from "@tanstack/react-query";

import {
  DeleteAxisPopover,
  InsertAxisItemPopover,
  UpdateAxisItemPopover,
} from "./axis-dialogs";
import { getBoardQueryOptions } from "./services";

type BoardContentProps = {
  boardId: string;
};

export const BoardContent = ({ boardId }: BoardContentProps) => {
  const getBoardQuery = useSuspenseQuery(getBoardQueryOptions({ boardId }));

  return (
    <>
      <pre>{JSON.stringify(getBoardQuery.data, null, 2)}</pre>
      <div>
        <span>X</span>
        {getBoardQuery.data.axis.x.map((item, index) => (
          <div key={item.id}>
            <span>{item.name}</span>
            <UpdateAxisItemPopover
              axisKey="x"
              board={getBoardQuery.data}
              index={index}
            />
            <DeleteAxisPopover
              axisKey="x"
              board={getBoardQuery.data}
              index={index}
            />
            <InsertAxisItemPopover
              axisKey="x"
              board={getBoardQuery.data}
              index={index}
            />
          </div>
        ))}
        {getBoardQuery.data.axis.x.length === 0 ? (
          <InsertAxisItemPopover
            axisKey="x"
            board={getBoardQuery.data}
            index={0}
          />
        ) : null}
      </div>
      <div>
        <span>Y</span>
        {getBoardQuery.data.axis.y.map((item, index) => (
          <div key={item.id}>
            <span>{item.name}</span>
            <UpdateAxisItemPopover
              axisKey="y"
              board={getBoardQuery.data}
              index={index}
            />
            <DeleteAxisPopover
              axisKey="y"
              board={getBoardQuery.data}
              index={index}
            />
            <InsertAxisItemPopover
              axisKey="y"
              board={getBoardQuery.data}
              index={index}
            />
          </div>
        ))}
        {getBoardQuery.data.axis.y.length === 0 ? (
          <InsertAxisItemPopover
            axisKey="y"
            board={getBoardQuery.data}
            index={0}
          />
        ) : null}
      </div>
    </>
  );
};
