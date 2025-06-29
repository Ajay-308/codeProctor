import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import logo from "@/app/assest/email-logo.png";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, interviewDate, link, interviewers } = req.body;

  if (!name || !email || !interviewDate || !link) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const candidateEmail = email;
  const interviewerEmails =
    Array.isArray(interviewers) && interviewers.length > 0
      ? interviewers.map((i) => i.email)
      : [];

  const allRecipients = [candidateEmail, ...interviewerEmails];

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

  const formattedDate = istDate.toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const htmlContent = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #ffffff; border-radius: 12px; border: 1px solid #e0e0e0; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);">
    <div style="text-align: center; margin-bottom: 30px;">
      <img src=${logo} alt="CodeProctor Logo" width="120" style="margin-bottom: 20px;" />
      <h2 style="color: #2c3e50; font-size: 24px;">Interview Invitation 📩</h2>
    </div>

    <p style="font-size: 16px; color: #333;">
      Hi <strong>${name}</strong>,
    </p>
    <p style="font-size: 16px; color: #333;">
      You have an interview scheduled through <strong>CodeProctor</strong>. Here are the details:
    </p>

    <div style="background: #f5f7fa; border-radius: 8px; padding: 15px 20px; margin: 20px 0;">
      <p style="margin: 0; font-size: 15px;"><strong>📅 Date & Time (IST):</strong><br />${formattedDate}</p>
      <p style="margin: 10px 0 0;"><strong>🔗 Interview Link:</strong><br /><a href="${link}" style="color: #1a73e8; text-decoration: none;">${link}</a></p>
    </div>

    ${
      interviewerEmails.length > 0
        ? `
      <div style="margin: 20px 0;">
        <p style="font-size: 15px; font-weight: 600; margin-bottom: 8px;">👤 Interviewers:</p>
        <ul style="padding-left: 20px; color: #444;">
          ${interviewers
            .map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (i: any) =>
                `<li style="margin-bottom: 5px;"><strong>${i.name}</strong> (${i.email})</li>`
            )
            .join("")}
        </ul>
      </div>`
        : ""
    }

    <p style="font-size: 15px; color: #555; margin-top: 25px;">
      Please be prepared and join the interview on time.
    </p>

    <div style="text-align: center; margin: 35px 0;">
      <a href="${link}" style="background-color: #4f46e5; color: white; padding: 14px 28px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block;">
        🔗 Join Interview
      </a>
    </div>

    <p style="font-size: 13px; color: #999; text-align: center;">
      – The CodeProctor Team
    </p>
  </div>
`;

  try {
    for (const recipient of allRecipients) {
      await transporter.sendMail({
        from: `"CodeProctor Team" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: "🎯 Interview Scheduled – CodeProctor",
        html: htmlContent,
      });

      console.log(`✅ Sent to ${recipient}`);
    }

    return res.status(200).json({ message: "Emails sent successfully." });
  } catch (error) {
    console.error("❌ Email sending error:", error);
    return res.status(500).json({ message: "Failed to send email." });
  }
}
