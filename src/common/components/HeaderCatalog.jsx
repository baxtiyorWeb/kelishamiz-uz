/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { get, head, isArray, isEqual, isNil } from "lodash";
import usePaginateQuery from "../../hooks/api/usePaginateQuery.js";
import KEYS from "../../export/keys.js";
import URLS from "../../export/urls.js";

const HeaderCatalog = ({ isOpen }) => {
  const [selected, setSelected] = useState(null);
  const { data: parentList } = usePaginateQuery({
    key: KEYS.categories,
    url: URLS.categories,
    enabled: !!isOpen,
  });

  const parents = isArray(get(parentList, "data.data", []))
    ? get(parentList, "data.data", [])
    : [];

  useEffect(() => {
    if (isNil(selected)) {
      setSelected(head(parents));
    }
  }, [parents, selected]);

  const childCategories = get(selected, "childCategories", []);

  return (
    isOpen && (
      <div className="absolute left-[15%] top-[8%] rounded-lg shadow-2xl  z-[999999] w-[72%] bg-white">
        <div className="min-h-[70vh] w-full rounded-[16px] bg-gray-light text-start text-[12px] font-bold">
          <div className="grid grid-cols-5 grid-rows-5 gap-4">
            <div className="row-span-5">
              <div className="col-span-3 mt-8 bg-gray-light">
                {parents?.map((item) => (
                  <button
                    className="flex w-full items-center justify-between px-6 py-3 hover:bg-gray"
                    key={get(item, "id")}
                    onClick={() => setSelected(item)}
                  >
                    <p>{get(item, "name")}</p>
                    {isEqual(get(item, "id"), get(selected, "id")) && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="6"
                        height="10"
                        viewBox="0 0 6 10"
                        fill="none"
                      >
                        <path
                          d="M1 9L5 5L1 1"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-4 row-span-5 min-h-[70vh] rounded-tr-[16px] bg-gray-light2">
              <div className="mt-8 pl-[145px] pr-[161px]">
                <h1 className="mb-6 mt-8 text-[20px] font-bold leading-normal">
                  {get(selected, "name")}
                </h1>
                <div className="my-3 h-[2px] w-full bg-[#D7D6D6]"></div>
                <div className="grid grid-cols-3 gap-x-[88px]">
                  {childCategories?.map((category) => (
                    <div key={get(category, "id")}>
                      {get(category, "name") && (
                        <>
                          <h2 className="mb-2 text-xs font-bold leading-normal text-black">
                            {get(category, "name")}
                          </h2>
                          <div className="my-3 h-[2px] w-full bg-[#D7D6D6]"></div>
                        </>
                      )}

                      <ul className="flex-1 space-y-1">
                        {isArray(get(category, "childCategories", [])) &&
                          get(category, "childCategories")?.map((item) => (
                            <li
                              key={get(item, "id")}
                              className="text-xs font-bold leading-normal text-black"
                            >
                              {get(item, "name")}
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default HeaderCatalog;
