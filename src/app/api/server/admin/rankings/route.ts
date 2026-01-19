import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    if (!year) return NextResponse.json([], { status: 200 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.rpc("get_candidate_rankings_with_missing_judges", {
      p_year: year
    });

    if (error) return NextResponse.json({ errorText: error.message }, { status: 400 });
    return NextResponse.json(data ?? [], { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ errorText: "Internal server error" }, { status: 500 });
  }
}