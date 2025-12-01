import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const { email, password } = await req.json();

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
                            cookieStore.set({ name, value });
                        })
                    }
                }
            }
        );

        const {
            data: { session },
            error: userError,
        } = await supabase.auth.signInWithPassword({ email, password });

        if (userError) {
            return NextResponse.json({ errorText: userError.message }, { status: 400 });
        }

        // FETCH ROLE
        const { data: roleData, error: roleError } = await supabase
            .from("users_info")
            .select("*")
            .eq("email", email)
            .single();

        if (roleError) {
            return NextResponse.json({ errorText: roleError.message }, { status: 400 });
        }

        return NextResponse.json({ role: roleData.role });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ errorText: "Internal server error!" }, { status: 500 });
    }
}