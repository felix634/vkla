import { NextResponse } from "next/server";
import { fiokEnabled } from "../../../lib/fiok/db";
import { kilepes } from "../../../lib/fiok/auth";

export async function POST() {
  if (fiokEnabled) await kilepes();
  return NextResponse.json({ ok: true });
}
