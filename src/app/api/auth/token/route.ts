import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { checkTokenRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const rateLimit = await checkTokenRateLimit(req);
  if (!rateLimit.allowed) {
    return NextResponse.json({ token: null }, { status: 429 });
  }

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ token: null }, { status: 401 });
  }
  return NextResponse.json({ token });
}
