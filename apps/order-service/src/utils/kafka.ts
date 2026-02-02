import { createConsumer, createKafkaClient, createProducer } from "@repo/kafka";
const kafkaClient = createKafkaClient("order-service");

export const consumer = createConsumer(kafkaClient, "order-group");

export const producer = createProducer(kafkaClient);
