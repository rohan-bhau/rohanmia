import { handlers } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    return await handlers.GET(req);
  } catch (error: any) {
    console.error("Auth handler GET error:", error);
    return NextResponse.json({ error: error?.message || "Auth error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await handlers.POST(req);
  } catch (error: any) {
    console.error("Auth handler POST error:", error);
    return NextResponse.json({ error: error?.message || "Auth error" }, { status: 500 });
  }
}
