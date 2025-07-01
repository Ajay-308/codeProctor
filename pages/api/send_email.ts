import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, deadline, link } = req.body;

  if (!email || !deadline || !link) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  // Support comma-separated emails or array
  const recipients: string[] = Array.isArray(email)
    ? email
    : email.split(",").map((e: string) => e.trim());

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const istDeadline = new Date(
    new Date(deadline).getTime() + 5.5 * 60 * 60 * 1000
  );

  try {
    for (const recipient of recipients) {
      await transporter.sendMail({
        from: `"CodeProctor Assignments" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: "📚 New Assignment Available",
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #fefefe;">
          <h2 style="color: #2c3e50;">Hi ${name || "Candidate"},</h2>

          <p style="font-size: 16px;">
            A new assignment has been assigned to you. Please review the details below.
          </p>

          <p style="font-size: 16px;">
            🕒 <strong>Submission Deadline:</strong><br />
            <span style="color: #555;">${istDeadline.toLocaleString()}</span>
          </p>

          <p style="font-size: 16px;">
            🔗 <strong>Assignment Link:</strong><br />
            <a href="${link}" style="color: #1a73e8; text-decoration: none;">${link}</a>
          </p>

          <p style="margin-top: 30px; font-size: 16px;">
            Kindly make sure to submit the assignment before the deadline.
          </p>

          <div style="margin-top: 40px; text-align: center;">
            <a href="${link}" style="display: inline-block; background-color: #1a73e8; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
              View Assignment
            </a>
          </div>

          <p style="margin-top: 50px; font-size: 14px; color: #888;">
            – CodeProctor Team
          </p>
        </div>
        `,
      });
    }

    return res
      .status(200)
      .json({ message: "Assignment emails sent successfully." });
  } catch (error) {
    console.error("❌ Assignment email error:", error);
    return res
      .status(500)
      .json({ message: "Failed to send assignment email." });
  }
}
