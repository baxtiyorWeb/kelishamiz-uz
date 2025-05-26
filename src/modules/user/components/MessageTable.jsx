import { get } from "lodash";
import { useEffect, useState } from "react";
import URLS from "../../../export/urls";
import usePostQuery from "../../../hooks/api/usePostQuery";
import useGetUser from "../../../hooks/services/useGetUser";
import Settings from "../pages/Settings";
import Table from "./ui/Table";
import Tabs from "./ui/Tabs";
import useGetAllQuery from "../../../hooks/api/useGetAllQuery";
import FavouritesComponents from "../../favourites/FavouritesComponents";

const columns = [
  {
    key: "img",
    title: "RASM",
    render: (_, item) => {
      return (
        <div>
          <img
            src={item?.images[item?.imageIndex]?.url || ""}
            alt=""
            className="w-[120px] h-[120px]"
          />
        </div>
      );
    },
  },
  { key: "title", title: "TITLE" },
  { key: "description", title: "QISQACHA" },
  { key: "price", title: "NARXI" },
  {
    key: "createdAt",
    title: "SANA",
    render: (value) => {
      const formatDate = (date) => {
        const dateObj = new Date(date);
        dateObj.setHours(dateObj.getHours() + 5);
        return dateObj.toLocaleString("uz-UZ", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      };
      return (
        <span className="text-gray-600 hover:text-gray-900">
          {formatDate(value)}
        </span>
      );
    },
  },
  {
    key: "viewCount",
    title: "Ko'rilganlar",
    render: (_, item) => {
      return <div>{item?.viewCount === null ? "0" : item?.viewCount}</div>;
    },
  },
  { key: "likesCount", title: "likelar" },
  {
    key: "negotiable",
    title: "kelishish",
    render: (_, item) => {
      return (
        <div>
          {item?.negotiable === true
            ? "kelishish mumkin"
            : "kelishish mumkin emas"}
        </div>
      );
    },
  },

  {
    key: "status",
    title: "KO'RISH",
    render: (value, record) => (
      <button
        className="text-gray-600 hover:text-gray-900"
        onClick={() => console.log("Clicked:", record.id)}
      >
        {value}
      </button>
    ),
  },
];

const tabs = [
  { key: "elonlar", label: "E'lonlar" },
  { key: "xabarlari", label: "Xabarlarim" },
  { key: "saqlangan", label: "Saqlanganlar" },
  { key: "qidiruv", label: "Qidiruvlar" },
  { key: "hisobim", label: "Mening hisobim" },
  { key: "sozlamalar", label: "Sozlamalar" },
];

const MessagesTable = () => {
  const [activeTab, setActiveTab] = useState("elonlar");
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState([]);
  const user = useGetUser();
  const { data, isLoading, isError } = useGetAllQuery({
    key: `${URLS.products}?page=1&pageSize=20`,
    url: `${URLS.products}?page=1&pageSize=20`,
  });

  return (
    <div className="">
      <h1 className="text-2xl font-semibold mb-3">Profil</h1>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-8 flex justify-between items-center ">
        <input
          type="text"
          className="border rounded-lg px-4 py-2 text-sm"
          placeholder="Mahsulot izlash"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-12">
        {activeTab === "elonlar" && (
          <Table
            columns={columns}
            data={data?.data?.content?.data}
            rowKey="id"
          />
        )}
        {activeTab === "sozlamalar" && <Settings />}
        {activeTab === "saqlangan" && <FavouritesComponents />}
      </div>
    </div>
  );
};

export default MessagesTable;
