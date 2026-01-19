import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const candidateId = searchParams.get("candidateId")
    const year = searchParams.get("year")
    if (!candidateId || !year) return NextResponse.json([], { status: 200 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const [{ data: rawData }, { data: categories }, { data: judges }] = await Promise.all([
      supabase.rpc("get_candidate_score_breakdown", { p_candidate_id: candidateId }),
      supabase.from("categories").select("id, name").eq("year", year),
      supabase.from("users_info").select("user_id, username").eq("role", "Judge")
    ])

    const lookup = (rawData ?? []).reduce((acc: Record<string, any>, item: any) => {
      acc[`${item.category_name}-${item.judge_name}`] = item
      return acc
    }, {})

    const fullData = []
    for (const category of categories ?? []) {
      for (const judge of judges ?? []) {
        const key = `${category.name}-${judge.username}`
        fullData.push({
          category_name: category.name,
          judge_name: judge.username,
          category_score: lookup[key]?.category_score ?? 0
        })
      }
    }

    return NextResponse.json(fullData, { status: 200 })
  } catch (err) {
    return NextResponse.json({ errorText: "Internal server error" }, { status: 500 })
  }
}