import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

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

  const istDate = new Date(
    new Date(interviewDate).getTime() + 5.5 * 60 * 60 * 1000
  );

  const formattedDate = istDate.toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const logoUrl = "https://code-proctor.vercel.app/assest/email-logo.png";

  const candidateEmailContent = `
    <div style="background: #f3f4f6; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="CodeProctor Logo" width="100" style="margin-bottom: 10px;" />
          <h2 style="color: #1f2937;">Interview Invitation 📩</h2>
        </div>
        <p style="font-size: 16px; color: #374151;">
          Hi <strong>${name}</strong>,
        </p>
        <p style="font-size: 16px; color: #374151;">
          Your interview has been scheduled via <strong>CodeProctor</strong>. Please review the details below:
        </p>
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p><strong>📅 Date & Time (IST):</strong><br />${formattedDate}</p>
          <p style="margin-top: 10px;"><strong>🔗 Link:</strong><br />
            <a href="${link}" style="color: #2563eb;">${link}</a>
          </p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
                  <p style="font-size:16px; color: #374151;">Please make sure You login in as candidate to start the interview.</p>
          <a href="${link}" style="background-color: #2563eb; color: white; padding: 14px 28px; font-size: 16px; border-radius: 6px; text-decoration: none;">
            🔗 Join Interview
          </a>
        </div>
        <p style="font-size: 13px; color: #9ca3af; text-align: center;">– The CodeProctor Team</p>
      </div>
    </div>
  `;

  const interviewerEmailContent = (interviewerName: string) => `
    <div style="background: #f3f4f6; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="CodeProctor Logo" width="100" style="margin-bottom: 10px;" />
          <h2 style="color: #1f2937;">You're Assigned to Interview 🎙️</h2>
        </div>
        <p style="font-size: 16px; color: #374151;">
          Hello <strong>${interviewerName}</strong>,
        </p>
        <p style="font-size: 16px; color: #374151;">
          You're assigned to conduct the following interview:
        </p>
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p><strong>📅 Date & Time (IST):</strong><br />${formattedDate}</p>
          <p style="margin-top: 10px;"><strong>🔗 Link:</strong><br />
            <a href="${link}" style="color: #2563eb;">${link}</a>
          </p>
        </div>
        <p style="font-size: 15px; color: #4b5563;">
          <strong>Candidate:</strong> ${name} (${email})
        </p>
        <div style="text-align: center; margin: 30px 0;">

          <a href="${link}" style="background-color: #16a34a; color: white; padding: 14px 28px; font-size: 16px; border-radius: 6px; text-decoration: none;">
            🎯 Start Interview
          </a>
        </div>
        <p style="font-size: 13px; color: #9ca3af; text-align: center;">– The CodeProctor Team</p>
      </div>
    </div>
  `;

  try {
    // Send email to candidate
    await transporter.sendMail({
      from: `"CodeProctor Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎯 Your Interview is Scheduled – CodeProctor",
      html: candidateEmailContent,
    });

    // Send email to each interviewer
    if (Array.isArray(interviewers)) {
      for (const i of interviewers) {
        await transporter.sendMail({
          from: `"CodeProctor Team" <${process.env.EMAIL_USER}>`,
          to: i.email,
          subject: "📢 Interview Assignment – CodeProctor",
          html: interviewerEmailContent(i.name),
        });
      }
    }

    return res.status(200).json({ message: "Emails sent successfully." });
  } catch (error) {
    console.error("❌ Email sending error:", error);
    return res.status(500).json({ message: "Failed to send emails." });
  }
}
