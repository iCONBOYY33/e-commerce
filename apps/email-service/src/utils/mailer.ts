import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // Shortcut for Gmail's SMTP settings - see Well-Known Services
  auth: {
    user: process.env.EMAIL_USER, // Your real gmail: e.g. "supprim@gmail.com"
    pass: process.env.EMAIL_PASS,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

export const sendMail = async ({
  email,
  subject,
  text,
}: {
  email: string;
  subject: string;
  text: string;
}) => {
  const res = await transporter.sendMail({
    from: "me@gmail.com",
    to: email,
    subject: subject,
    text: text,
  });
  console.log("Message Sent", res);
};
