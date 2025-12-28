import type { NodeProps } from "@xyflow/react";
import type { AxisResult } from "convex/nodes";

type AxisNodeProps = NodeProps & {
  data: AxisResult["data"];
};

export const AxisNode = ({ data }: AxisNodeProps) => {
  return <div className="flex flex-col items-start">{data.label}</div>;
};

// type BoardAxisProps = {
//   boardId: Id<"boards">;
// };

// const BoardAxis = ({ boardId }: BoardAxisProps) => {
//   const getBoardQuery = useSuspenseQuery(
//     convexQuery(api.boards.queryBoard, { boardId }),
//   );

//   return (
//     <>
//       <div>
//         <pre>{JSON.stringify(getBoardQuery.data, null, 2)}</pre>
//         <span>X</span>
//         {getBoardQuery.data.axis.x.map((item, index) => (
//           <div key={item.id}>
//             <span>{item.name}</span>
//             <UpdateAxisItemPopover
//               axisKey="x"
//               board={getBoardQuery.data}
//               index={index}
//             />
//             <DeleteAxisPopover
//               axisKey="x"
//               board={getBoardQuery.data}
//               index={index}
//             />
//             <InsertAxisItemPopover
//               axisKey="x"
//               board={getBoardQuery.data}
//               index={index}
//             />
//           </div>
//         ))}
//         {getBoardQuery.data.axis.x.length === 0 ? (
//           <InsertAxisItemPopover
//             axisKey="x"
//             board={getBoardQuery.data}
//             index={0}
//           />
//         ) : null}
//       </div>
//       <div>
//         <span>Y</span>
//         {getBoardQuery.data.axis.y.map((item, index) => (
//           <div key={item.id}>
//             <span>{item.name}</span>
//             <UpdateAxisItemPopover
//               axisKey="y"
//               board={getBoardQuery.data}
//               index={index}
//             />
//             <DeleteAxisPopover
//               axisKey="y"
//               board={getBoardQuery.data}
//               index={index}
//             />
//             <InsertAxisItemPopover
//               axisKey="y"
//               board={getBoardQuery.data}
//               index={index}
//             />
//           </div>
//         ))}
//         {getBoardQuery.data.axis.y.length === 0 ? (
//           <InsertAxisItemPopover
//             axisKey="y"
//             board={getBoardQuery.data}
//             index={0}
//           />
//         ) : null}
//       </div>
//     </>
//   );
// };
