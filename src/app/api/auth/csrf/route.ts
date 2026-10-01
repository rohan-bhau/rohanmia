import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    csrfToken: "verified-csrf-token-" + Date.now()
  });
}
