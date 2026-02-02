import React from "react";
import { auth } from "@clerk/nextjs/server";
import { OrderType } from "@repo/types";

const fetchOrders = async () => {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    const response = await fetch(
      `${process.env.SERVER_ORDER_SERVICE_URL}/orders`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
      console.error(
        `API error in client: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const data = await response.json();
    console.log("API response in client:", data);

    // Handle both { orders: [] } and [] formats
    const orders = Array.isArray(data) ? data : data.orders;

    if (!Array.isArray(orders)) {
      console.error("Orders data is not an array:", data);
      return [];
    }

    return orders;
  } catch (error) {
    console.log(error);
    return [];
  }
};

async function page() {
  const orders: OrderType[] = await fetchOrders();

  if (!orders) {
    return <div>no orders found</div>;
  }
  return (
    <div className="">
      <h1 className="text-2xl my-4 font-medium">Your Orders</h1>
      <ul>
        {orders.map((order) => (
          <li key={order._id} className="flex items-center mb-4">
            <div className="w-1/4">
              <span className="font-medium text-sm text-gray-500">
                Order ID
              </span>
              <p>{order._id}</p>
            </div>
            <div className="w-1/12">
              <span className="font-medium text-sm text-gray-500">Total</span>
              <p>{order.amount / 100}</p>
            </div>
            <div className="w-1/12">
              <span className="font-medium text-sm text-gray-500">Status</span>
              <p>{order.status}</p>
            </div>
            <div className="w-1/8">
              <span className="font-medium text-sm text-gray-500">Date</span>
              <p>
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-US")
                  : "-"}
              </p>
            </div>
            <div className="">
              <span className="font-medium text-sm text-gray-500">
                Products
              </span>
              <p>
                {order.products?.map((product) => product.name).join(", ") ||
                  "-"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default page;
