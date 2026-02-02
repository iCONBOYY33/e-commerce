import { OrderType } from "@repo/types";
import { Order } from "@repo/order-db";
import { producer } from "../utils/kafka";
export const createOrder = async (order: OrderType) => {
  const newOrder = new Order(order);
  try {
    await newOrder.save();

    await producer.send("order.created", {
      value: {
        email: order.email,
        amount: order.amount,
        status: order.status,
      },
    });
    return newOrder;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
