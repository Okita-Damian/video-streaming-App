const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const sendEmail = async ({
  to,
  subject,
  templatePath,
  replacements = {},
  html,
}) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 465,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 20000,
  });

  let htmlContent = html;
  if (!htmlContent && templatePath) {
    const filePath = path.join(__dirname, templatePath);
    htmlContent = fs.readFileSync(filePath, "utf-8");
  }

  for (const key in replacements) {
    htmlContent = htmlContent.replace(
      new RegExp(`{{${key}}}`, "g"),
      replacements[key]
    );
  }
  await transport.sendMail({
    from: "Video Stream App <no-reply@videostream.com>",
    to,
    subject,
    html: htmlContent,
  });
};

module.exports = sendEmail;
