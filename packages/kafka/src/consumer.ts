import { Consumer, Kafka } from "kafkajs";

export const createConsumer = (kafka: Kafka, groupId: string) => {
  const consumer: Consumer = kafka.consumer({ groupId });

  const connect = async () => {
    await consumer.connect();
    console.log("Consumer connected:" + groupId);
  };

  const handlers = new Map<string, (message: any) => Promise<void>>();
  let isRunning = false;

  const subscribe = async (
    topicOrSubscriptions:
      | string
      | { topicName: string; topicHandler: (message: any) => Promise<void> }[],
    handler?: (message: any) => Promise<void>
  ) => {
    if (Array.isArray(topicOrSubscriptions)) {
      for (const sub of topicOrSubscriptions) {
        await consumer.subscribe({ topic: sub.topicName, fromBeginning: true });
        handlers.set(sub.topicName, sub.topicHandler);
      }
    } else if (typeof topicOrSubscriptions === "string" && handler) {
      await consumer.subscribe({
        topic: topicOrSubscriptions,
        fromBeginning: true,
      });
      handlers.set(topicOrSubscriptions, handler);
    }

    if (!isRunning) {
      isRunning = true;
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const handler = handlers.get(topic);
            if (handler) {
              const value = message.value?.toString();
              if (value) {
                await handler(JSON.parse(value));
              }
            }
          } catch (error) {
            console.log(error);
          }
        },
      });
    }
  };

  const disconnect = async () => {
    await consumer.disconnect();
    console.log("Consumer disconnected");
  };

  return { connect, subscribe, disconnect };
};
