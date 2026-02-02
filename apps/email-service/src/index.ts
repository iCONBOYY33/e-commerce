import { sendMail } from "./utils/mailer";
import { consumer } from "./utils/kafka";
const start = async () => {
  try {
    await consumer.connect();

    await consumer.subscribe([
      {
        topicName: "user.created",
        topicHandler: async (message: any) => {
          const { email, username } = message.value;

          if (email && username) {
            await sendMail({
              email,
              subject: "Test",
              text: `Hello ${username}, your email is ${email}`,
            });
            console.log("Email sent successfully from the auth service");
          }
        },
      },
      {
        topicName: "order.created",
        topicHandler: async (message: any) => {
          const { email, amount, status } = message.value;

          if (email && amount && status) {
            await sendMail({
              email,
              subject: "Order has been created",
              text: `Hello !, your order : ${amount / 100} status : ${status}`,
            });
            console.log("Email sent successfully from the order service");
          }
        },
      },
    ]);
    console.log("Email service started");
  } catch (error) {
    console.log(error);
  }
};

start();
