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

    // Get all judges
    const { data: judges } = await supabase
      .from("users_info")
      .select("user_id, username")
      .eq("role", "Judge")

    // Get all categories for this year
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name, percentage, criteria") // criteria contains criteria_name & percentage
      .eq("year", year)

    // Get scores for this candidate
    const { data: scores } = await supabase
      .from("scores")
      .select("*")
      .eq("candidate_id", candidateId)

    const fullData: any[] = []

    for (const category of categories ?? []) {
      for (const judge of judges ?? []) {
        const scoreRecord = scores?.find(
          s => s.judge_id === judge.user_id && s.category_id === category.id
        )

        // Sum of scores for criteria (raw total of criteria)
        const criteriaScores = scoreRecord?.criteria ?? []
        const totalCriteriaScore = criteriaScores.reduce(
          (sum: number, c: any) => sum + (c.score ?? 0), 0
        )

        // Sum of all criteria percentages (should normally be 100)
        const totalCriteriaPercentage = category.criteria.reduce(
          (sum: number, c: any) => sum + (c.percentage ?? 0), 0
        )

        // Normalize to category percentage
        const category_score_scaled = totalCriteriaPercentage
          ? (totalCriteriaScore / totalCriteriaPercentage) * category.percentage
          : 0

        fullData.push({
          category_name: category.name,
          judge_name: judge.username,
          category_score: parseFloat(category_score_scaled.toFixed(2)),
          category_percentage: category.percentage
        })
      }
    }

    return NextResponse.json(fullData, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ errorText: "Internal server error" }, { status: 500 })
  }
}
