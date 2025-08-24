import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { name, email, interviewDate, link } = await req.json();

  if (!email || !interviewDate || !link) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const istDate = new Date(
    new Date(interviewDate).getTime() + 5.5 * 60 * 60 * 1000
  );

  try {
    await transporter.sendMail({
      from: `"CodeProctor Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎯 Assignment Notification",
      html: `<p>Hi ${name}, your assignment is on ${istDate.toLocaleString()}.</p>
             <a href="${link}">Join Assignment</a>`,
    });

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json(
      { message: "Failed to send email" },
      { status: 500 }
    );
  }
}
