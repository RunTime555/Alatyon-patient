import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/auth";

export async function POST() {
  const token = cookies().get("session_token")?.value;
  if (token) await deleteSession(token);

  const res = NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_APP_URL)
  );
  res.cookies.delete("session_token");
  return res;
}