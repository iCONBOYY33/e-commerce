import ProductList from "@/components/ProductList";

const ProductsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    category: string;
    sort: string;
    params: string;
    search: string;
  }>;
}) => {
  const category = (await searchParams).category;
  const sort = (await searchParams).sort;
  const search = (await searchParams).search;
  const params = (await searchParams).params;
  return (
    <div className="">
      <ProductList
        category={category}
        sort={sort}
        params="products"
        search={search}
      />
    </div>
  );
};

export default ProductsPage;
