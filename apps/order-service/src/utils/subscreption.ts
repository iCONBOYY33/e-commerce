import { consumer } from "./kafka";
import { createOrder } from "./order";

export const runKafkaSubscriptions = () => {
  consumer.subscribe("payment.successful", async (message) => {
    console.log("recieved message : order created  :", message.value);
    const orderData = { ...message.value, status: "completed" };
    console.log("Processing order with data:", orderData);
    const order = await createOrder(orderData);
    console.log("order created :", order);
  });
};
