import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const year = new URL(req.url).searchParams.get("year");

        const { NEXT_PUBLIC_SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseKey } = process.env;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ errorText: "Database environment variables are not set." }, { status: 404 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.from("categories").select("*").eq("year", year)
        if (error) {
            return NextResponse.json({ errorText: error.message }, { status: 404 });
        }

        return NextResponse.json((data), { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ errorText: "Internal server error." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { year, category_name, percentage, criteria } = await req.json();
        const { NEXT_PUBLIC_SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseKey } = process.env;
        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ errorText: "Database environment variables are not set." }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error } = await supabase.from("categories").insert({ year, name: category_name, percentage, criteria});
        if (error) {
            return NextResponse.json({ errorText: error.message }, { status: 404 });
        }

        return NextResponse.json({ state: "Success" }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ errorText: "Internal server error." }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, category_name, percentage, criteria } = await req.json();
        const { NEXT_PUBLIC_SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseKey } = process.env;
        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ errorText: "Database environment variables are not set." }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error } = await supabase.from("categories").update({ name: category_name, percentage, criteria}).eq("id", id).select();
        if (error) {
            return NextResponse.json({ errorText: error.message }, { status: 404 });
        }

        return NextResponse.json({ state: "Success" }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ errorText: "Internal server error." }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        const { NEXT_PUBLIC_SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseKey } = process.env;
        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ errorText: "Database environment variables are not set." }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (error) {
            return NextResponse.json({ errorText: error.message }, { status: 404 });
        }

        return NextResponse.json({ state: "Success" }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ errorText: "Internal server error." }, { status: 500 });
    }
}