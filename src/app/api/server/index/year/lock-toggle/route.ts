import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
    try {
        const { NEXT_PUBLIC_SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseKey } = process.env;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ errorText: "Database not configured!" }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get the priority year
        const { data: yearData, error } = await supabase
            .from("years")
            .select("id, lock")
            .eq("priority", true)
            .single();

        if (error || !yearData) {
            return NextResponse.json({ errorText: "Priority year not found" }, { status: 404 });
        }

        // Toggle the lock
        const newLockStatus = !yearData.lock;

        const { data: updatedYear, error: updateError } = await supabase
            .from("years")
            .update({ lock: newLockStatus })
            .eq("id", yearData.id)
            .select()
            .single();

        if (updateError || !updatedYear) {
            return NextResponse.json({ errorText: "Failed to toggle lock" }, { status: 500 });
        }

        return NextResponse.json({ lock: updatedYear.lock }, { status: 200 });
    } catch (err) {
        console.error("Lock toggle error:", err);
        return NextResponse.json({ errorText: "Internal Server Error" }, { status: 500 });
    }
}
