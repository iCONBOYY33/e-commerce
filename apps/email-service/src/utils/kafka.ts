import { createProducer, createConsumer, createKafkaClient } from "@repo/kafka";

const kafka = createKafkaClient("email-service");
const consumer = createConsumer(kafka, "auth-service");

export { consumer };
