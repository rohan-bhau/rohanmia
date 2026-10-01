import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    google: {
      id: "google",
      name: "Google",
      type: "oauth",
      signinUrl: "/api/auth/signin/google",
      callbackUrl: "/api/auth/callback/google"
    },
    github: {
      id: "github",
      name: "GitHub",
      type: "oauth",
      signinUrl: "/api/auth/signin/github",
      callbackUrl: "/api/auth/callback/github"
    }
  });
}
