import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { NEXT_PUBLIC_SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseKey } = process.env;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ errorText: "Database not configured!" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the priority year
    const { data: yearData, error } = await supabase
      .from("years")
      .select("year, lock")
      .eq("priority", true)
      .single();

    if (error || !yearData) {
      return NextResponse.json({ errorText: "Priority year not found" }, { status: 404 });
    }

    return NextResponse.json({ lock: yearData.lock });

  } catch (err) {
    console.error("Year lock check error:", err);
    return NextResponse.json({ errorText: "Internal Server Error" }, { status: 500 });
  }
}