import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, title, description, email, browser, steps } = body;

    if (!email || !title || !description) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: `"CodeProctor Feedback" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, 
      subject: `[CodeProctor Feedback] ${title}`,
      html: `
        <h2>New Issue Reported</h2>
        <p><strong>Type:</strong> ${type || "N/A"}</p>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Description:</strong><br/>${description.replace(/\n/g, "<br/>")}</p>
        <p><strong>Steps to Reproduce:</strong><br/>${steps?.replace(/\n/g, "<br/>") || "N/A"}</p>
        <p><strong>Browser/System Info:</strong> ${browser || "N/A"}</p>
        <p><strong>Reporter Email:</strong> ${email}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Feedback sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Feedback email error:", error);

   
    return NextResponse.json(
      { message: "Failed to send feedback email." },
      { status: 500 }
    );
  }
}
