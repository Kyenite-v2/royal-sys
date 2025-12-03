import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
    try{
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { data, error } = await supabase.from("users_info").select("*");
        if(error) {
            return NextResponse.json({ errorText: error.message }, { status: 404 });
        }

        return NextResponse.json(data)
    } catch(e) {
        return NextResponse.json({ errorText: "Internal server error." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { username, email, password, role } = await req.json();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabasePrivateKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabaseAuth = createClient(supabaseUrl, supabasePrivateKey);

        const { data: createData, error: createError } = await supabaseAuth.auth.admin.createUser({ email, password, email_confirm: true });
        if(createError) {
            return NextResponse.json({ errorText: createError.message }, { status: 400 })
        }

        const { data: infoData, error: infoError } = await supabaseAuth.from("users_info").insert({user_id: createData.user?.id, username, email, role});
        if(infoError) {
            return NextResponse.json({ errorText: infoError.message }, { status: 400 })
        }
        
        return NextResponse.json({ state: "Success" }, { status: 200 });
    } catch(e) {
        return NextResponse.json({ errorText: "Internal server error!" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, username, email, password, role } = await req.json();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabasePrivateKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabaseAuth = createClient(supabaseUrl, supabasePrivateKey);

        const { error: createError } = await supabaseAuth.auth.admin.updateUserById(id , { email, password });
        if(createError) {
            return NextResponse.json({ errorText: createError.message }, { status: 400 })
        }

        const { error: infoError } = await supabaseAuth.from("users_info").update({ username, email, role }).eq("user_id", id).select();
        if(infoError) {
            return NextResponse.json({ errorText: infoError.message }, { status: 400 })
        }
        
        return NextResponse.json({ state: "Success" }, { status: 200 });
    } catch(e) {
        return NextResponse.json({ errorText: "Internal server error!" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try{
        const { id } = await req.json();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabase = createClient(supabaseUrl, supabaseKey);

        if(!id) {
            return NextResponse.json({ errorText: "Cannot find user." }, { status: 404 });
        }

        const { error } = await supabase.auth.admin.deleteUser(id);
        if(error) {
            return NextResponse.json({ errorText: error.message });
        }

        return NextResponse.json({ state: "Success" }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ errorText: "Internal server error." }, { status: 500 });
    }
}