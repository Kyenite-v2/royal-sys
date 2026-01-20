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
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

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

type YearProps = {
    year: string
    priority: boolean
    lock: boolean
}

export default function Page() {
    const [rankings, setRankings] = useState<CandidateRank[]>([])
    const [breakdowns, setBreakdowns] = useState<Record<number, Breakdown[]>>({})
    const [loading, setLoading] = useState(false)
    const [year, setYear] = useState<string>("")
    const [lock, setLock] = useState<boolean>(false)
    const [lockLoading, setLockLoading] = useState(false)

    // ------------------------
    // Load priority year
    // ------------------------
    useEffect(() => {
        async function loadYears() {
            const res = await fetch("/api/server/admin/year")
            const data = await res.json()
            if (res.status !== 200) return

            const yearsData: YearProps[] = data
            const defaultYear = yearsData.find(item => item.priority === true)

            if (defaultYear) {
                setYear(defaultYear.year)
                setLock(defaultYear.lock)
            }
        }
        loadYears()
    }, [])

    // ------------------------
    // Load rankings for selected year
    // ------------------------
    useEffect(() => {
        if (!year) return

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

    // ------------------------
    // Fetch candidate breakdowns
    // ------------------------
    const fetchBreakdown = async (candidateId: number) => {
        if (breakdowns[candidateId]) return
        try {
            const res = await fetch(
                `/api/server/admin/rankings/breakdown?candidateId=${candidateId}&year=${year}`
            )
            const data = await res.json()
            if (res.status === 200)
                setBreakdowns(prev => ({ ...prev, [candidateId]: data }))
        } catch (err) {
            console.error(err)
        }
    }

    // ------------------------
    // Toggle Lock/Unlock year
    // ------------------------
    const toggleLock = async () => {
        if (!year) return
        setLockLoading(true)
        try {
            const res = await fetch("/api/server/admin/year/lock-toggle", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ year }),
            })
            const data = await res.json()
            if (res.ok) {
                setLock(data.lock)
                toast.success(`Year ${data.lock ? "locked" : "unlocked"} successfully!`)
            } else {
                toast.error(data.errorText || "Failed to toggle lock")
            }
        } catch (err) {
            console.error(err)
            toast.error("Failed to toggle lock")
        }
        setLockLoading(false)
    }

    const groupedByRole = {
        Ms: rankings.filter(r => r.role === "Ms"),
        Mr: rankings.filter(r => r.role === "Mr"),
    }

    return (
        <AdminSidebarMenu>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="block md:hidden" />
                    <h1 className="text-2xl font-bold">Candidate Management</h1>
                </div>
                <Button
                    className={`ml-4 ${lock ? "bg-red-600 hover:bg-red-700" : "bg-purple-500 hover:bg-purple-600"}`}
                    onClick={toggleLock}
                    disabled={lockLoading}
                    variant={lock ? "destructive" : "default"}
                >
                    {lockLoading
                        ? "Processing..."
                        : lock
                            ? "Unlock Year"
                            : "Lock Year"}
                </Button>
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
        </AdminSidebarMenu>
    )
}

// ------------------------
// Judge Breakdown Table
// ------------------------
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
                        {category} — <span className="text-sm text-gray-400">Max: {rows[0].category_percentage}%</span>
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