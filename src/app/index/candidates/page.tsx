'use client'
import CandidateCard from "@/components/built-in/candidates-card";
import SidebarMenu from "@/components/built-in/sidebar-menu";
import { useState } from "react";

const sampleData = [{
    imageUrl: "/sample.jpeg",
    name: "Sample Name 1",
    candidate_no: 1,
    criteria: [{
        criteria_name: "Testing 1",
        percentage: 20,
        value: 20
    }, {
        criteria_name: "Testing 2",
        percentage: 80,
        value: 70
    }]
}, {
    imageUrl: "/sample.jpeg",
    name: "Sample Name 2",
    candidate_no: 1,
    criteria: [{
        criteria_name: "Testing 1",
        percentage: 30,
        value: 25
    }, {
        criteria_name: "Testing 2",
        percentage: 70,
        value: 20
    }]
}]

export default function Page() {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    return (
        <SidebarMenu>

            {/* CATEGORY TITLE */}
            <div className="py-3 px-8 min-w-xs w-fit mx-auto border border-[#3A2E52] 
                            rounded-lg text-center font-bold text-[#C9A86A] 
                            bg-[#110B1C]/60 backdrop-blur-sm shadow-md">
                Category 1
            </div>

            {/* CONTENT GRID */}
            <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-16">

                {
                    sampleData && sampleData.map((item, i)=>{
                        return(
                            <CandidateCard key={i} index={i} imageUrl={item.imageUrl} name={item.name} candidate_no={item.candidate_no} criteria={item.criteria} isEditing={editingIndex === i} editingIndex={editingIndex} setEditingIndex={setEditingIndex} />
                        )
                    })
                }

            </div>
        </SidebarMenu>
    );
}