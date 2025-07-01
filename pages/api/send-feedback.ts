import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { type, title, description, email, browser, steps } = req.body;

  if (!email || !title || !description) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // = codeProctor.team@gmail.com
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    const mailOptions = {
      from: `"CodeProctor Feedback" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send it to the same address
      subject: `[CodeProctor Feedback] ${title}`,
      html: `
        <h2>New Issue Reported</h2>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Description:</strong><br/>${description.replace(/\n/g, "<br/>")}</p>
        <p><strong>Steps to Reproduce:</strong><br/>${steps?.replace(/\n/g, "<br/>") || "N/A"}</p>
        <p><strong>Browser/System Info:</strong> ${browser}</p>
        <p><strong>Reporter Email:</strong> ${email}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Feedback sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
