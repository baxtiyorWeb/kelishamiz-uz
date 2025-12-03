import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

const CatalogBreadCrumbs = ({ category }) => {
  return (
    <div className="bg-gradient-to-r rounded-xl mb-3 from-white to-purple-50/40 border-b border-gray-100">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center gap-2 text-sm flex-wrap">

          <Link
            to="/"
            className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors font-medium
                       px-3 py-1.5 bg-gray-50 rounded-xl hover:bg-purple-100 shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Bosh sahifa</span>
          </Link>

          <ChevronRight className="w-4 h-4 text-gray-400" />

          {category?.parent && (
            <>
              <Link
                to={`/catalog/${category.parent.id}`}
                className="text-gray-600 hover:text-purple-600 transition-colors px-3 py-1.5
                           bg-gray-50 rounded-xl hover:bg-purple-100 shadow-sm font-medium"
              >
                {category.parent.name}
              </Link>

              <ChevronRight className="w-4 h-4 text-gray-400" />
            </>
          )}

          <span
            className="text-purple-700 font-semibold bg-purple-100 px-3 py-1.5 rounded-xl shadow-sm"
          >
            {category?.name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CatalogBreadCrumbs;
