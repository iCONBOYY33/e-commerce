import { Kafka } from "kafkajs";

export const createKafkaClient = (service: string) => {
  return new Kafka({
    clientId: service,
    brokers: process.env.KAFKA_BROKERS
      ? process.env.KAFKA_BROKERS.split(",")
      : ["localhost:9094"],
  }); 
};
