import { ConvexHttpClient } from "convex/browser";
import { NextResponse, type NextRequest } from "next/server";

import { api } from "../../../../convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;
const SPECIAL_WAITLIST_EMAILS = new Set([
  "nsl6265@stern.nyu.edu",
  "ntl2695@stern.nyu.edu",
  "ck3880@nyu.edu",
]);

function isAllowedWaitlistEmail(email: string) {
  return /^[^\s@]+@nyu\.edu$/.test(email) || SPECIAL_WAITLIST_EMAILS.has(email);
}

export async function POST(request: NextRequest) {
  if (!convexUrl) {
    return NextResponse.json(
      { error: "Convex is not configured." },
      { status: 500 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body === "object" && body && "email" in body
    ? String(body.email)
    : "";
  const normalizedEmail = email.trim().toLowerCase();

  if (!isAllowedWaitlistEmail(normalizedEmail)) {
    return NextResponse.json(
      { error: "Use your @nyu.edu email." },
      { status: 400 }
    );
  }

  const convex = new ConvexHttpClient(convexUrl);
  const result = await convex.mutation(api.emails.add, {
    email: normalizedEmail,
  });

  return NextResponse.json(result);
}
