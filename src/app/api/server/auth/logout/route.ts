import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const cookieStore = await cookies();

        const { NEXT_PUBLIC_SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseAdminKey } = process.env;
        if (!supabaseUrl || !supabaseAdminKey) {
            return NextResponse.json({ errorText: "Database environment variables are not set." }, { status: 400 });
        }

        const supabase = createServerClient(supabaseUrl, supabaseAdminKey, {
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
        });

        const { error } = await supabase.auth.signOut();
        if (error) {
            return NextResponse.json({ errorText: error.message }, { status: 404 });
        }

        return NextResponse.json({ message: "Successfully logged out." }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ errorText: "Internal server error." }, { status: 500 });
    }
}