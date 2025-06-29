import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, interviewDate, link } = req.body;

  if (!email || !interviewDate || !link) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  // Support comma-separated string or array of emails
  const recipients: string[] = Array.isArray(email)
    ? email
    : email.split(",").map((e: string) => e.trim());

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const istDate = new Date(
    new Date(interviewDate).getTime() + 5.5 * 60 * 60 * 1000
  );

  try {
    for (const recipient of recipients) {
      await transporter.sendMail({
        from: `"codeProctor Team" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: "You're Invited: Interview Scheduled!",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #fafafa;">
      <h2 style="color: #2c3e50;">Hi ${name},</h2>

      <p style="font-size: 16px;">
        We're excited to inform you that your interview has been successfully scheduled.
      </p>

      <p style="font-size: 16px;">
        📅 <strong>Date & Time:</strong><br />
        <span style="color: #555;">${istDate.toLocaleString()}</span>
      </p>

      <p style="font-size: 16px;">
        🔗 <strong>Interview Link:</strong><br />
        <a href="${link}" style="color: #1a73e8; text-decoration: none;">${link}</a>
      </p>

      <p style="margin-top: 30px; font-size: 16px;">
        Please be prepared and join on time. We look forward to speaking with you!
      </p>

      <div style="margin-top: 40px; text-align: center;">
        <a href="${link}" style="display: inline-block; background-color: #1a73e8; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
          Join Interview
        </a>
      </div>

      <p style="margin-top: 50px; font-size: 14px; color: #888;">
        – The HR Team at CodeProctor
      </p>
    </div>
        `,
      });

      console.log(`✅ Sent to ${recipient}`);
    }

    return res.status(200).json({ message: "Emails sent to all recipients." });
  } catch (error) {
    console.error("❌ Email sending error:", error);
    return res.status(500).json({ message: "Failed to send email." });
  }
}
