import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name, email, interviewDate, link } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"HR Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Interview Scheduled",
      html: `
        <p>Hi ${name},</p>
        <p>Your interview is scheduled for <strong>${new Date(interviewDate).toLocaleString()}</strong>.</p>
        <p>Join here: <a href="${link}">${link}</a></p>
        <br />
        <p>Best of luck!</p>
      `,
    });

    res.status(200).json({ message: "Interview email sent successfully." });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
}
