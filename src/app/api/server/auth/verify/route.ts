import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiestoSet) {
                        cookiestoSet.forEach(({ name, value }) => {
                            cookieStore.set(name, value);
                        })
                    }
                }
            }
        );

        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            return NextResponse.json({ isAuth: false }, { status: 401 });
        }

        const { data: roleData, error: roleError } = await supabase
            .from("users_info")
            .select("role")
            .eq("user_id", user.id)
            .single();

        if (roleError) {
            return NextResponse.json({ errorText: roleError.message }, { status: 400 });
        }

        return NextResponse.json({ isAuth: true, role: roleData.role }, { status: 200 });
    } catch (e) {
        console.error("Auth verify error:", e);
        return NextResponse.json({ errorText: "Internal server error." }, { status: 500 });
    }
}