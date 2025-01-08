import ItemCard from "./ItemCard";
import useInfiniteScrollQuery from "../../hooks/api/useInfiniteScrollQuery";
import KEYS from "../../export/keys";
import URLS from "../../export/urls";
import { get, isArray } from "lodash";
import InfiniteScroll from "react-infinite-scroll-component";
const Recommenduem = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteScrollQuery({
      key: KEYS.product_list,
      url: URLS.product_list,
    });

  const items = isArray(get(data, "pages", []))
    ? get(data, "pages", []).flat()
    : [];

  return (
    <div>
      <InfiniteScroll
        dataLength={items?.length}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={<h4>loading ...</h4>}
        style={{ width: "100%", paddingTop: 15 }}
        pullDownToRefreshThreshold={50}
      >
        <div className={`response_product_category grid grid-cols-5 gap-5 `}>
          {items?.map((item, index) => (
            <ItemCard key={index} item={item} />
          ))}
        </div>
      </InfiniteScroll>

      {isFetchingNextPage && "loading ..."}
    </div>
  );
};

export default Recommenduem;
