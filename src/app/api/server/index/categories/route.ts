import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
    try{
        const { NEXT_PUBLIC_SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseKey } = process.env;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ errorText: "Database environment variables are not set." }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: yearData, error: yearError } = await supabase.from("years").select("*");
        if (yearError) {
            return NextResponse.json({ errorText: yearError.message }, { status: 404 });
        }

        const { data, error } = await supabase.from("categories").select("*").eq("year", yearData[0].year);
        if (error) {
            return NextResponse.json({ errorText: error.message }, { status: 404 });
        }

        return NextResponse.json((data), { status: 200 });
    } catch(e) {
        console.error(e);
        return NextResponse.json({ errorText: "Internal server error." }, { status: 500 });
    }
}