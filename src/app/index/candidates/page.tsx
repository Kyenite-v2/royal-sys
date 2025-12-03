'use client'
import CandidateCard from "@/components/built-in/candidates-card";
import SidebarMenu from "@/components/built-in/sidebar-menu";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
                                                                           
type DataProps = {
    // Candidate Data
    year: string;

    candidate_id: string;
    image_url: string;
    candidate_name: string;
    candidate_no: number;
    role: string;

    // Category Data
    name: string;
    percentage: number;

    // Criteria Data
    criteria: []
}

export default function Page() {
    const useParams = useSearchParams();
    const category = useParams.get("category");
    const [data, setData] = useState<DataProps[]>([]);

    const [categoryName, setCategoryName] = useState<string>("Please select a category!")
    const [totalPercentage, setTotalPercentage] = useState<string>("Please select a category!")

    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    useEffect(() => {
        async function fetchData() {
            const res = await fetch("/api/server/index/candidates?category=" + category);

            const data = await res.json();
            if (res.status !== 200) {
                toast.error("Failed to fetch data.");
                return;
            }

            setCategoryName(data[0].name || "Please select a category!");
            setTotalPercentage(data[0].percentage);
            setData(data);
        }

        fetchData();
    }, [category])

    return (
        <SidebarMenu>

            {/* CATEGORY TITLE */}
            <div className="py-3 px-8 min-w-xs w-fit mx-auto border border-[#3A2E52] 
                            rounded-lg text-center font-bold text-[#C9A86A] 
                            bg-[#110B1C]/60 backdrop-blur-sm shadow-md">
                {categoryName} ({totalPercentage}%)
            </div>

            {/* CONTENT GRID */}
            <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-16">

                {
                    data && data.map((item, i) => {
                        return (
                            <CandidateCard key={i} year={item.year} category_id={category || ""} candidate_id={item.candidate_id} index={i} image_url={item.image_url} name={item.candidate_name} candidate_no={item.candidate_no} candidate_role={item.role} criteria={item.criteria} isEditing={editingIndex === i} editingIndex={editingIndex} setEditingIndex={setEditingIndex} />
                        )
                    })
                }

            </div>
        </SidebarMenu>
    );
}