import { NextResponse } from "next/server";
import { fiokEnabled } from "../../../lib/fiok/db";
import { tokenBevaltas } from "../../../lib/fiok/auth";

// A levélben kapott link beváltása (a megerősítő oldal gombja hívja).
export async function POST(req: Request) {
  if (!fiokEnabled) {
    return NextResponse.json({ error: "A szülői fiók hamarosan indul." }, { status: 503 });
  }
  let token = "";
  try {
    token = String((await req.json()).t ?? "");
  } catch {
    return NextResponse.json({ error: "Hibás kérés." }, { status: 400 });
  }
  const email = token ? await tokenBevaltas(token) : null;
  if (!email) {
    return NextResponse.json(
      { error: "A link lejárt vagy már felhasználták. Kérj új belépési linket." },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
