import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";

export async function GET(): Promise<NextResponse> {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ token: null }, { status: 401 });
  }
  return NextResponse.json({ token });
}
