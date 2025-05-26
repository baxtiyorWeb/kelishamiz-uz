/* eslint-disable react/prop-types */
import { memo } from "react";

const Table = ({ columns = [], data = [], rowKey = "" }) => {
  console.log(data);

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-white border-b">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-4 text-left text-sm font-semibold text-gray-900"
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr
              key={item[rowKey]}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 text-sm text-gray-500">
                  {col.render
                    ? col.render(item[col.key], item, index)
                    : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default memo(Table);
