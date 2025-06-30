import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { message: "Missing stream call ID" },
      { status: 400 }
    );
  }

  try {
    const interview = await convex.query(
      api.interviews.getInterviewByStreamId,
      {
        streamCallId: `default:${id}`,
      }
    );

    if (!interview) {
      return NextResponse.json(
        { message: "Interview not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(interview);
  } catch (err) {
    console.error("Fetch error:", err);
    return NextResponse.json({ message: "Failed to fetch" }, { status: 500 });
  }
}
