import { NextRequest, NextResponse } from "next/server";
import allProblemsData from "@/cleaned_problems.json";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  const problem = (
    Array.isArray(allProblemsData)
      ? allProblemsData
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (allProblemsData as { allProblems: any[] }).allProblems
  )?.find((p) => p.id === id);

  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  return NextResponse.json(problem);
}
