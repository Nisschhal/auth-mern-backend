import { MailtrapClient } from "mailtrap";
import dotevn from "dotenv";

dotevn.config();

export const mailTrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});

export const sender = {
  email: "mailtrap@demomailtrap.com",
  name: "Nischal Puri",
};
