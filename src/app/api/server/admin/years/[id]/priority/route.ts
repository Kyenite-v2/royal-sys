import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id);

  // Reset all priority first
  await supabase.from("years").update({ priority: false }).neq("id", id);

  // Set the selected one to true
  const { error } = await supabase.from("years").update({ priority: true }).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(id);
}
