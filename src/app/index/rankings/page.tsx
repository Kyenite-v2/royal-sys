'use client'

import { useEffect, useState } from "react"
import SidebarMenu from "@/components/built-in/sidebar-menu"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@radix-ui/react-separator"

type CandidateRank = {
    candidate_id: number
    candidate_name: string
    role: "Ms" | "Mr"
    total_score: number
    rank: number
}

type Breakdown = {
    judge_name: string
    category_name: string
    category_score: number
    category_percentage: number
}

export default function Page() {
    const [rankings, setRankings] = useState<CandidateRank[]>([])
    const [breakdowns, setBreakdowns] = useState<Record<number, Breakdown[]>>({})
    const [loading, setLoading] = useState(false)
    const [year, setYear] = useState<string>("")

    useEffect(() => {
        async function loadYear() {
            try {
                const res = await fetch("/api/server/index/year")
                const data = await res.json()
                if (res.status !== 200) return

                const defaultYear = (data ?? []).find((item: any) => item.priority === true)
                if (defaultYear) setYear(defaultYear.year)
            } catch (err) {
                console.error(err)
            }
        }
        loadYear()
    }, [])

    useEffect(() => {
        if (!year) return

        const loadRankings = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/server/index/rankings?year=${year}`)
                const data = await res.json()
                if (res.status === 200) setRankings(data)
                else setRankings([])
            } catch (err) {
                console.error(err)
                setRankings([])
            }
            setLoading(false)
        }

        loadRankings()
    }, [year])

    const fetchBreakdown = async (candidateId: number) => {
        if (breakdowns[candidateId]) return
        try {
            const res = await fetch(
                `/api/server/index/rankings/breakdown?candidateId=${candidateId}&year=${year}`
            )
            const data = await res.json()
            if (res.status === 200) {
                const formattedData = data.map((item: any) => ({
                    ...item,
                    category_percentage: item.category_percentage ?? 100 // fallback to 100 if missing
                }))
                setBreakdowns(prev => ({ ...prev, [candidateId]: formattedData }))
            }
        } catch (err) {
            console.error(err)
        }
    }

    const groupedByRole = {
        Ms: rankings.filter(r => r.role === "Ms"),
        Mr: rankings.filter(r => r.role === "Mr"),
    }

    return (
        <SidebarMenu>
            <div>
                <h1 className="text-2xl font-bold mb-4">Rankings</h1>
                <Separator className="my-4" />

                <div className="space-y-10">
                    {(["Ms", "Mr"] as const).map(role => (
                        <div key={role}>
                            <div className="flex items-center w-full my-6">
                                <div className="flex-grow border-t border-gray-400" />
                                <span className="px-4 text-2xl font-semibold">{role} Rankings</span>
                                <div className="flex-grow border-t border-gray-400" />
                            </div>

                            <Accordion type="single" collapsible>
                                {groupedByRole[role].map(candidate => (
                                    <AccordionItem
                                        key={candidate.candidate_id}
                                        value={String(candidate.candidate_id)}
                                        className="hover:bg-gray-400/30 data-[state=open]:bg-gray-400/20 transition-colors"
                                    >
                                        <AccordionTrigger
                                            className="px-4"
                                            onClick={() => fetchBreakdown(candidate.candidate_id)}
                                        >
                                            <div className="flex justify-between w-full pr-4">
                                                <span>
                                                    Rank {candidate.rank} — {candidate.role}. {candidate.candidate_name}
                                                </span>
                                                <span className="font-semibold">{candidate.total_score}%</span>
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="px-6">
                                            {!breakdowns[candidate.candidate_id] ? (
                                                <p className="text-sm text-gray-500">Loading breakdown...</p>
                                            ) : (
                                                <JudgeBreakdownTable data={breakdowns[candidate.candidate_id]} />
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>

                            {!groupedByRole[role].length && !loading && (
                                <p className="text-center text-gray-500 mt-4">No candidates found.</p>
                            )}
                        </div>
                    ))}

                    {loading && <p className="text-center text-gray-500">Loading rankings...</p>}
                </div>
            </div>
        </SidebarMenu>
    )
}

function JudgeBreakdownTable({ data }: { data: Breakdown[] }) {
    const grouped = data.reduce((acc, item) => {
        if (!acc[item.category_name]) acc[item.category_name] = []
        acc[item.category_name].push(item)
        return acc
    }, {} as Record<string, Breakdown[]>)

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([category, rows]) => (
                <div key={category}>
                    {/* Category name + Max Percentage */}
                    <h3 className="font-semibold text-lg underline mb-2">
                        {category} — <span className="text-sm text-gray-400">
                            Max: {rows[0]?.category_percentage ?? 0}%
                        </span>
                    </h3>

                    <div className="grid grid-cols-2 gap-y-1">
                        {rows.map((row, idx) => (
                            <div key={idx} className="col-span-2 grid grid-cols-2">
                                <span>Judge: {row.judge_name}</span>
                                <span className="text-right">
                                    Score: {row.category_score} / {row.category_percentage}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}