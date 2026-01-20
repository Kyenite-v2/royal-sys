'use client'
import CandidateCard from "@/components/built-in/candidates-card";
import SidebarMenu from "@/components/built-in/sidebar-menu";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type DataProps = {
    year: string;
    candidate_id: string;
    image_url: string;
    candidate_name: string;
    candidate_no: number;
    role: string;
    name: string;
    percentage: number;
    criteria: [];
};

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const category = searchParams.get("category");

    const [data, setData] = useState<DataProps[]>([]);
    const [categoryName, setCategoryName] = useState("Please select a category!");
    const [totalPercentage, setTotalPercentage] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const checkLock = async () => {
            try {
                const res = await fetch("/api/server/index/year-lock");
                if (!res.ok) return;

                const data = await res.json();
                if (data.lock === true) {
                    toast.info("Scoring is now locked.");
                    clearInterval(pollingRef.current!);
                    router.replace("/index/rankings");
                }

                console.log("Lock status:", data.lock);
            } catch (err) {
                console.error("Lock check failed", err);
            }
        };

        checkLock();

        const intervalMs = editingIndex !== null ? 5000 : 10000;

        pollingRef.current = setInterval(checkLock, intervalMs);

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [editingIndex, router]);

    useEffect(() => {
        if (!category) return;

        const fetchData = async () => {
            const res = await fetch(`/api/server/index/candidates?category=${category}`);
            if (!res.ok) {
                toast.error("Failed to fetch data.");
                return;
            }

            const data = await res.json();
            setCategoryName(data[0]?.name || "Please select a category!");
            setTotalPercentage(data[0]?.percentage || "");
            setData(data);
        };

        fetchData();
    }, [category]);

    return (
        <SidebarMenu>
            <div className="py-3 px-8 min-w-xs w-fit mx-auto border border-[#3A2E52] 
                            rounded-lg text-center font-bold text-[#C9A86A] 
                            bg-[#110B1C]/60 backdrop-blur-sm shadow-md">
                {categoryName} {totalPercentage && <>({totalPercentage}%)</>}
            </div>

            <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-16">
                {data.map((item, i) => (
                    <CandidateCard
                        key={i}
                        year={item.year}
                        category_id={category || ""}
                        candidate_id={item.candidate_id}
                        index={i}
                        image_url={item.image_url}
                        name={item.candidate_name}
                        candidate_no={item.candidate_no}
                        candidate_role={item.role}
                        criteria={item.criteria}
                        isEditing={editingIndex === i}
                        editingIndex={editingIndex}
                        setEditingIndex={setEditingIndex}
                        totalPercentage={parseInt(totalPercentage)}
                    />
                ))}
            </div>
        </SidebarMenu>
    );
}