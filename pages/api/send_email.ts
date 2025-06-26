import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name, email, interviewDate, link, interviewers } = req.body;
  const interviewerList = interviewers
    .map((interviewer: { email: string }) => interviewer.email)
    .join(",");
  console.log("sending email to:", email, "and cc:", interviewerList);
  if (!email) {
    return res.status(400).json({ message: "Missing email." });
  }
  if (!interviewDate) {
    return res.status(400).json({ message: "Missing interview date." });
  }
  if (!link) {
    return res.status(400).json({ message: "Missing interview link." });
  }
  if (!interviewers) {
    return res.status(400).json({ message: "Missing interviewer ID." });
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const istDate = new Date(
    new Date(interviewDate).getTime() + 5.5 * 60 * 60 * 1000
  );
  try {
    await transporter.sendMail({
      from: `"HR Team" <${process.env.EMAIL_USER}>`,
      to: email,
      cc: interviewerList,
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

    res.status(200).json({ message: "Interview email sent successfully." });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
}
