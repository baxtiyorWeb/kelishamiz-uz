"use client"

import { get, head, isArray, isEqual, isNil } from "lodash"
import { useEffect, useState } from "react"
import KEYS from "../../export/keys.js"
import URLS from "../../export/urls.js"
import usePaginateQuery from "../../hooks/api/usePaginateQuery.js"
import { ChevronRight, ShoppingBag, X } from "lucide-react"
import { cn } from "../../lib/utils.jsx"

const HeaderCatalog = ({ isOpen, setisOpen }) => {
  const [selected, setSelected] = useState(null)
  const { data: parentList } = usePaginateQuery({
    key: KEYS.categories,
    url: URLS.categories,
    enabled: !!isOpen,
  })

  const parents = isArray(get(parentList, "data.content", [])) ? get(parentList, "data.content", []) : []

  useEffect(() => {
    if (isNil(selected)) {
      setSelected(head(parents))
    }
  }, [parents, selected])

  const childCategories = get(selected, "children", [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset"

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  return isOpen ? (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => setisOpen(false)}
    >
      <div
        className="relative w-11/12 max-w-6xl rounded-xl bg-white shadow-2xl transition-all duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setisOpen(false)}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex h-[80vh] overflow-hidden rounded-xl">
          {/* Left sidebar - Parent categories */}
          <div className="w-1/4 bg-gradient-to-b from-emerald-600 to-emerald-800 p-4 overflow-y-auto">
            <div className="mb-4 flex items-center gap-2 px-2 text-white">
              <ShoppingBag className="h-5 w-5" />
              <h2 className="text-lg font-bold">Categories</h2>
            </div>

            <div className="space-y-1">
              {parents?.map((item) => (
                <button
                  className={cn(
                    "group w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
                    isEqual(get(item, "id"), get(selected, "id"))
                      ? "bg-white text-emerald-800"
                      : "text-white hover:bg-white/10",
                  )}
                  key={get(item, "id")}
                  onClick={() => setSelected(item)}
                >
                  <span className="truncate">{get(item, "name")}</span>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isEqual(get(item, "id"), get(selected, "id"))
                        ? "text-emerald-600"
                        : "text-white/70 group-hover:translate-x-1",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right content - Child categories */}
          <div className="w-3/4 bg-white p-6 overflow-y-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">{get(selected, "name")}</h1>
              <div className="mt-2 h-1 w-20 rounded bg-emerald-600"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6">
              {childCategories?.map((category) => (
                <div key={get(category, "id")} className="mb-4">
                  {get(category, "name") && (
                    <h2 className="font-medium text-emerald-700 mb-2 pb-1 border-b border-emerald-100">
                      {get(category, "name")}
                    </h2>
                  )}
                  <ul className="space-y-1">
                    {isArray(get(category, "childCategories", [])) &&
                      get(category, "childCategories")?.map((item) => (
                        <li
                          key={get(item, "id")}
                          className="cursor-pointer text-sm text-gray-600 hover:text-emerald-600 py-1 transition-colors duration-150 flex items-center"
                        >
                          <div className="w-1 h-1 bg-gray-300 rounded-full mr-2"></div>
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
  ) : null
}

export default HeaderCatalog
