import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const year = req.nextUrl.searchParams.get("year");
        const { NEXT_PUBLIC_SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseAdminKey } = process.env;

        if (!supabaseUrl || !supabaseAdminKey) {
            return NextResponse.json({ errorText: "Database environment variables are not set." }, { status: 404 });
        }

        const supabase = createClient(supabaseUrl, supabaseAdminKey);

        const { data, error } = await supabase.from("candidates").select("*").eq("year", year).order("candidate_no", { ascending: true }).order("role", { ascending: true });
        if (error) {
            return NextResponse.json({ errorText: error.message }, { status: 404 });
        }

        return NextResponse.json((data), { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ errorText: "Internal server error." }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const year = formData.get("year");
        const role = formData.get("role");
        const candidate_no = formData.get("candidate_no");
        const candidate_name = formData.get("candidate_name");
        const candidate_image = formData.get("candidate_image");

        if (!year || !role || !candidate_no || !candidate_name || !candidate_image) {
            return NextResponse.json({ errorText: "Missing required fields." }, { status: 400 });
        }

        const { NEXT_PUBLIC_SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseAdminKey } = process.env;

        if (!supabaseUrl || !supabaseAdminKey) {
            return NextResponse.json({ errorText: "Database environment variables are not set." }, { status: 404 });
        }

        const supabase = createClient(supabaseUrl, supabaseAdminKey);

        const { error: fetchError } = await supabase.from("candidates").select("*").eq("year", year).eq("candidate_no", candidate_no).eq("role", role).single();
        if (fetchError === null) {
            return NextResponse.json({ errorText: "Candidate with the same number in a role already exists for the selected year." }, { status: 400 });
        }

        const image = candidate_image as File;

        const ext = image.name.split('.').pop();
        const fileName = `candidate_${year}_${candidate_no}_${crypto.randomUUID()}.${ext}`;

        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: imageError } = await supabase.storage.from("candidates").upload(fileName, buffer, {
            contentType: image.type
        })

        if (imageError) {
            return NextResponse.json({ errorText: imageError.message }, { status: 404 });
        }

        const { data: imgUrlData } = supabase.storage.from("candidates").getPublicUrl(fileName);
        const { error } = await supabase.from("candidates").insert({
            year,
            role,
            candidate_no,
            candidate_name,
            image_url: imgUrlData.publicUrl
        })
        if (error) {
            return NextResponse.json({ errorText: error.message }, { status: 404 });
        }

        return NextResponse.json({ state: "Success" }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ errorText: "Internal server error." }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const formData = await req.formData();

        const id = formData.get("id");
        const role = formData.get("role");
        const candidate_no = formData.get("candidate_no");
        const candidate_name = formData.get("candidate_name");
        const candidate_image = formData.get("candidate_image");

        if (!id || !role || !candidate_no || !candidate_name) {
            return NextResponse.json({ errorText: "Missing required fields." }, { status: 400 });
        }

        const { NEXT_PUBLIC_SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseAdminKey } = process.env;

        if (!supabaseUrl || !supabaseAdminKey) {
            return NextResponse.json({ errorText: "Database environment variables are not set." }, { status: 404 });
        }

        const supabase = createClient(supabaseUrl, supabaseAdminKey);

        const { data: existingCandidate, error: fetchError } = await supabase.from("candidates").select("*").eq("id", id).single();
        if (fetchError) {
            return NextResponse.json({ errorText: fetchError.message }, { status: 404 });
        }

        let imageUrl = existingCandidate.image_url;

        if (candidate_image && (candidate_image as File).size > 0) {
            const image = candidate_image as File;
            const ext = image.name.split('.').pop();
            const fileName = `candidate_${existingCandidate.year}_${candidate_no}_${crypto.randomUUID()}.${ext}`;

            const arrayBuffer = await image.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const { error: imageError } = await supabase.storage.from("candidates").upload(fileName, buffer, {
                contentType: image.type
            })
            if (imageError) {
                return NextResponse.json({ errorText: imageError.message }, { status: 404 });
            }
            const { data: imgUrlData } = supabase.storage.from("candidates").getPublicUrl(fileName);
            imageUrl = imgUrlData.publicUrl;

            const { error: deleteError } = await supabase.storage.from("candidates").remove([existingCandidate.image_url.split('/candidates/')[1] || ""]);
            if (deleteError) {
                return NextResponse.json({ errorText: deleteError.message }, { status: 404 });
            }
        }

        const { error: updateError } = await supabase.from("candidates").update({
            role,
            candidate_no,
            candidate_name,
            image_url: imageUrl
        }).eq("id", id);

        if (updateError) {
            return NextResponse.json({ errorText: updateError.message }, { status: 404 });
        }

        return NextResponse.json({ state: "Success" }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ errorText: "Internal server error." }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { NEXT_PUBLIC_SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseAdminKey } = process.env;
        if (!supabaseUrl || !supabaseAdminKey) {
            return NextResponse.json({ errorText: "Database environment variables are not set." }, { status: 404 });
        }

        const supabase = createClient(supabaseUrl, supabaseAdminKey);

        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ errorText: "Candidate ID is required." }, { status: 400 });
        }

        const { data: candidateData, error: fetchError } = await supabase.from("candidates").delete().eq("id", id).select().single();
        if (fetchError) {
            return NextResponse.json({ errorText: fetchError.message }, { status: 404 });
        }
        const { error: deleteError } = await supabase.storage.from("candidates").remove([candidateData.image_url.split('/candidates/')[1] || ""]);
        if (deleteError) {
            return NextResponse.json({ errorText: deleteError.message }, { status: 404 });
        }

        return NextResponse.json({ state: "Success" }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ errorText: "Internal server error." }, { status: 500 });
    }
}