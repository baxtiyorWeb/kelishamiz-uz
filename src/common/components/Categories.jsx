import { get, isArray } from "lodash";
import { Link } from "react-router-dom";
import KEYS from "../../export/keys";
import URLS from "../../export/urls";
import useGetAllQuery from "../../hooks/api/useGetAllQuery";

const Categories = () => {
  const { data, isLoading } = useGetAllQuery({
    key: KEYS.categories,
    url: URLS.categories,
  });

  const items = isArray(get(data, "data.content", []))
    ? get(data, "data.content", [])
    : [];

  const placeholderItems = Array(8).fill(null);

  return (
    <div className="container mx-auto px-2 py-2">
      <h2 className="text-xl md:text-xl font-semibold text-gray-800 mb-2">
        Top Categories
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-10 gap-1 md:gap-1">
        {isLoading
          ? placeholderItems.map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="mt-3 h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))
          : items.map((item, index) => (
              <Link
                key={get(item, "id", index)}
                to={`/catalog/${get(item, "id")}`}
                className="flex flex-col items-center group transition-all duration-300"
              >
                <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-emerald-100 group-hover:border-emerald-500 transition-all duration-300">
                  {item?.file?.fileBase64 ? (
                    <img
                      src={`data:image/png;base64,${item.file.fileBase64}`}
                      alt={get(item, "name", "Category")}
                      className="w-full h-full object-cover p-2 bg-white"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <span className="text-xl font-bold">
                        {get(item, "name", "").charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <span className="mt-3 text-center text-sm text-gray-700 group-hover:text-emerald-600 transition-colors duration-300">
                  {get(item, "name", "Category")}
                </span>
              </Link>
            ))}
      </div>
    </div>
  );
};

export default Categories;
