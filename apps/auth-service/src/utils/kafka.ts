import { createKafkaClient, createProducer } from "@repo/kafka";

const kafka = createKafkaClient("auth-service");

const producer = createProducer(kafka);

export { producer };
