import AppAreaChart from "@/components/AppAreaChart";
import AppBarChart from "@/components/AppBarChart";
import AppPieChart from "@/components/AppPieChart";
import CardList from "@/components/CardList";
import TodoList from "@/components/TodoList";
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";

const Homepage = async () => {
  const { getToken } = await auth();
  const token = await getToken();
  const orderchartDataPromise = fetch(
    `${process.env.SERVER_ORDER_SERVICE_URL}/orders-varchart`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    },
  )
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        console.error(
          `Fetch failed for orders-varchart: ${res.status} ${text}`,
        );
        return { data: [] };
      }
      return res.json();
    })
    .then((res) => res.data || [])
    .catch((err) => {
      console.error("Error fetching orders-varchart:", err);
      return [];
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
      <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <Suspense fallback={<div>Loading chart...</div>}>
          <AppBarChart dataPromise={orderchartDataPromise} />
        </Suspense>
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg">
        <CardList title="Latest Transactions" />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg">
        <AppPieChart />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg">
        <TodoList />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <AppAreaChart />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg">
        <CardList title="Popular Products" />
      </div>
    </div>
  );
};

export default Homepage;
