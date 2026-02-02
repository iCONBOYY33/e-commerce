import { Kafka, Producer } from "kafkajs";

export const createProducer = (Kafka: Kafka) => {
  const producer: Producer = Kafka.producer();
 
  const connect = async () => {
    await producer.connect();
    console.log("Producer connected");
  };

  const send = async (topic: string, message: any) => {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log(`Sent message: ${message} to topic: ${topic}`);
  };

  const disconnect = async () => {
    await producer.disconnect();
    console.log("Producer disconnected");
  };

  return { connect, send, disconnect };
};
