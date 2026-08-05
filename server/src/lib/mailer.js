import nodemailer from "nodemailer";

const enabled = process.env.EMAIL_ENABLED === "true";
let transporter = null;

if (enabled && process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
} else {
  transporter = {
    sendMail: async (opts) => {
      // In development or when disabled, log messages
      // eslint-disable-next-line no-console
      console.log("Email disabled or not configured. Mail would be:", opts);
      return Promise.resolve({ accepted: [opts.to] });
    },
  };
}

async function sendMail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || (process.env.SMTP_USER || `no-reply@${process.env.CLIENT_URL?.replace(/^https?:\/\//, "") || "campusfind.local"}`);
  return transporter.sendMail({ from, to, subject, text, html });
}

export default { sendMail };
