'use client'

import { useEffect, useState } from "react"
import AdminSidebarMenu from "@/components/built-in/admin-sidebar"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { SidebarTrigger } from "@/components/ui/sidebar"
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
}

type YearProps = {
    year: string;
    priority: boolean;
};

export default function Page() {
    const [rankings, setRankings] = useState<CandidateRank[]>([])
    const [breakdowns, setBreakdowns] = useState<Record<number, Breakdown[]>>({})
    const [loading, setLoading] = useState(false)
    const [year, setYear] = useState<string>("")

    useEffect(() => {
        async function loadYears() {
            const res = await fetch("/api/server/admin/year");
            const data = await res.json();
            if (res.status !== 200) {
                return
            }

            const yearsData: YearProps[] = data;

            const defaultYear = yearsData.filter(item => item.priority === true);

            if (defaultYear.length > 0) {
                setYear(defaultYear[0].year);
            }
        }

        loadYears();
    }, [])

    useEffect(() => {
        const loadRankings = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/server/admin/rankings?year=${year}`)
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
            const res = await fetch(`/api/server/admin/rankings/breakdown?candidateId=${candidateId}&year=${year}`)
            const data = await res.json()
            if (res.status === 200) setBreakdowns(prev => ({ ...prev, [candidateId]: data }))
        } catch (err) {
            console.error(err)
        }
    }

    const groupedByRole = {
        Ms: rankings.filter(r => r.role === "Ms"),
        Mr: rankings.filter(r => r.role === "Mr"),
    }

    return (
        <AdminSidebarMenu>
            <div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="block md:hidden" />
                        <h1 className="text-2xl font-bold">Candidate Management</h1>
                    </div>
                </div>

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
                                                <span>Rank {candidate.rank} — {candidate.role}. {candidate.candidate_name}</span>
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
        </AdminSidebarMenu>
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
                    <h3 className="font-semibold text-lg underline mb-2">{category}</h3>
                    <div className="grid grid-cols-2 gap-y-1">
                        {rows.map((row, idx) => (
                            <div key={idx} className="col-span-2 grid grid-cols-2">
                                <span>Judge: {row.judge_name}</span>
                                <span className="text-right">Score: {row.category_score}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}