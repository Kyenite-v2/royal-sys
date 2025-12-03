import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const categoryId = req.nextUrl.searchParams.get("category");

        const { NEXT_PUBLIC_SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseKey } = process.env;

        if(!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ errorText: "Database variables not configurated!" });
        }

        const supabaseAuth = createServerClient(supabaseUrl!, supabaseKey!, {
            cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiestoSet) {
                        cookiestoSet.forEach(({ name, value }) => {
                            cookieStore.set({ name, value });
                        })
                    }
            },
        });

        const supabase = createClient(supabaseUrl, supabaseKey);

        if(!categoryId) {
            return NextResponse.json({ errorText: "Category ID is required." }, { status: 400 });
        }

        // Get user
        const { data: userData } = await supabaseAuth.auth.getUser();
        if (!userData.user) {
            return NextResponse.json({ errorText: "Unauthorized" }, { status: 401 });
        }
        const judge_id = userData.user.id;

        // Get current year
        const { data: yearData, error: yearError } = await supabase.from("years").select("*").eq("priority", true);

        if (!yearData || yearError) return NextResponse.json({ errorText: yearError.message || "No year found!" }, { status: 404 });

        const priorityYear = yearData[0].year;

        // Get category
        const { data: categoryData, error: categoryError } = await supabase
            .from("categories")
            .select("*")
            .eq("id", categoryId)
            .eq("year", priorityYear)
            .single();
        if (categoryError) return NextResponse.json({ errorText: "Cannot find category." }, { status: 404 });

        // Get candidates
        const { data: candidatesData, error: candidatesError } = await supabase
            .from("candidates")
            .select("*")
            .eq("year", priorityYear);
        if (candidatesError) return NextResponse.json({ errorText: "Cannot find candidates." }, { status: 404 });

        // Get scores for this judge and category
        const { data: scoresData } = await supabase
            .from("scores")
            .select("*")
            .eq("judge_id", judge_id)
            .eq("category_id", categoryId)
            .eq("year", priorityYear);

        // Build DataProps[]
        const result = candidatesData.map((candidate) => {
            // find the score record for this candidate
            const scoreRecord = scoresData?.find((s) => s.candidate_id === candidate.id) || null;

            // For each criteria in category
            const criteriaData = categoryData.criteria.map((c: any) => {
                let score = 0;
                if (scoreRecord && scoreRecord.criteria) {
                    const matched = scoreRecord.criteria.find((sc: any) => sc.criteria_name === c.criteria_name);
                    if (matched) score = matched.score;
                }
                return {
                    criteria_name: c.criteria_name,
                    percentage: c.percentage,
                    score,
                };
            });

            return {
                // Candidate Data
                year: yearData[0].year,
                candidate_id: candidate.id,
                image_url: candidate.image_url,
                candidate_name: candidate.candidate_name,
                candidate_no: candidate.candidate_no,
                role: candidate.role,

                // Category Data
                name: categoryData.name,
                percentage: categoryData.percentage,

                // Criteria Data
                criteria: criteriaData,
            };
        });

        return NextResponse.json(result);

    } catch (e) {
        console.error("Error fetching candidates:", e);
        return NextResponse.json({ errorText: e }, { status: 500 });
    }
}

type CriteriaScore = {
  criteria_name: string;
  score: number;
};

interface ScorePayload {
  candidate_id: number;
  category_id: number;
  year: string;
  criteria: CriteriaScore[];
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const body: ScorePayload = await req.json();

    const { candidate_id, category_id, year, criteria } = body;

    if (!candidate_id || !category_id || !year || !criteria) {
      return NextResponse.json(
        { errorText: "candidate_id, category_id, year, and criteria are required" },
        { status: 400 }
      );
    }

    const { NEXT_PUBLIC_SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseKey } = process.env;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ errorText: "Database variables not configured!" }, { status: 500 });
    }

    const supabaseAuth = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiestoSet) => cookiestoSet.forEach(({ name, value }) => cookieStore.set({ name, value })),
      },
    });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authenticated user
    const { data: userData } = await supabaseAuth.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ errorText: "Unauthorized" }, { status: 401 });
    }
    const judge_id = userData.user.id;

    // Upsert the score record
    const { data: updatedScore, error } = await supabase
      .from("scores")
      .upsert(
        [
          {
            judge_id,
            candidate_id,
            category_id,
            criteria: criteria,
            year,
          }
        ], {
            onConflict: "judge_id,candidate_id,category_id"
        }
      )
      .select();

    if (error) {
      console.error("Upsert error:", error);
      return NextResponse.json({ errorText: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Score updated successfully", updatedScore }, { status: 200 });
  } catch (e) {
    console.error("Error updating scores:", e);
    return NextResponse.json({ errorText: "Internal Server Error" }, { status: 500 });
  }
}