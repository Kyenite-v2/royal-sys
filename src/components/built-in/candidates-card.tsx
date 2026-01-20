"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";

type CriteriaItem = {
    criteria_name: string;
    percentage: number;
    score: number;
};

type CandidateCardProps = {
    year: string;
    category_id: string;
    candidate_id: string;
    index: number;
    image_url: string;
    name: string;
    candidate_no: number;
    candidate_role: string;
    criteria: CriteriaItem[];
    isEditing: boolean;
    editingIndex: number | null;
    setEditingIndex: (val: number | null) => void;
    totalPercentage: number;
};

export default function CandidateCard({
    year,
    category_id,
    candidate_id,
    index,
    image_url,
    name,
    candidate_no,
    candidate_role,
    criteria,
    isEditing,
    editingIndex,
    setEditingIndex,
    totalPercentage
}: CandidateCardProps) {

    const [overallPercentage, setOverallPercentage] = useState<number>(0);
    const [values, setValues] = useState<string[]>([]);

    /**
     * Initialize input values when data changes
     */
    useEffect(() => {
        setValues(criteria.map(c => c.score.toString()));
        setEditingIndex(null);
    }, [criteria, candidate_id, category_id, setEditingIndex]);

    /**
     * Recalculate total score whenever inputs change
     */
    useEffect(() => {
        if (values.length !== criteria.length) return;

        let total = 0;

        values.forEach((val) => {
            const score = parseInt(val) || 0;
            total += score;
        });

        const weighted = (totalPercentage / 100) * total;
        setOverallPercentage(Number(weighted.toFixed(2)));

    }, [values, criteria, totalPercentage]);

    /**
     * Clamp and update input values
     */
    const updateValue = (i: number, newVal: string) => {
        if (newVal === "") {
            setValues(prev => {
                const next = [...prev];
                next[i] = "";
                return next;
            });
            return;
        }

        let val = parseInt(newVal);
        if (isNaN(val)) return;
        if (val < 0) val = 0;
        if (val > criteria[i].percentage) val = criteria[i].percentage;

        setValues(prev => {
            const next = [...prev];
            next[i] = val.toString();
            return next;
        });
    };

    /**
     * Save scores to API
     */
    const saveScores = async () => {
        const payload = {
            candidate_id,
            category_id,
            year,
            criteria: values.map((score, i) => ({
                criteria_name: criteria[i].criteria_name,
                percentage: criteria[i].percentage,
                score: parseInt(score) || 0,
            })),
        };

        try {
            const res = await fetch("/api/server/index/candidates", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Save failed");

            toast.success("Scores updated!");
            setEditingIndex(null);
        } catch (err) {
            console.error(err);
            toast.error("Failed to save scores");
        }
    };

    return (
        <Card className="bg-[#120D1E] border border-[#2A213A] shadow-lg rounded-2xl text-gray-200">

            <CardHeader className="space-y-3">
                <div className="h-58 rounded-xl overflow-hidden border border-[#302542] bg-[#1E152E]">
                    <img
                        src={image_url.replace(
                            /^http:\/\/127\.0\.0\.1/,
                            `http://${window.location.hostname}`
                        )}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex justify-between text-[#C9A86A] font-semibold">
                    <h1>{candidate_role}. {name}</h1>
                    <p className="text-sm bg-[#1F162E] px-3 py-1 rounded-lg border border-[#3A2E52]">
                        No. {candidate_no}
                    </p>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {criteria.map((item, i) => (
                    <div key={i} className="grid grid-cols-5 items-center text-sm">

                        <div className="col-span-3">{item.criteria_name}</div>

                        <div className="text-[#C9A86A]">{item.percentage}%</div>

                        <Input
                            type="number"
                            value={values[i] ?? ""}
                            min={0}
                            max={item.percentage}
                            disabled={!isEditing || editingIndex !== index}
                            onChange={e => updateValue(i, e.target.value)}
                            className="bg-[#1A1228] border-[#3A2E52] text-gray-100 focus-visible:ring-[#C9A86A]"
                        />
                    </div>
                ))}

                <div className="text-center space-x-2">
                    <span className="font-bold">Total Score:</span>
                    <span>{overallPercentage}%</span>
                </div>
            </CardContent>

            <CardFooter>
                <Button
                    className={`mx-auto px-12 py-4 ${
                        isEditing
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    onClick={() => {
                        if (isEditing) {
                            saveScores();
                        } else {
                            setEditingIndex(index);
                        }
                    }}
                    disabled={!isEditing && editingIndex !== null}
                >
                    {isEditing ? "Save" : "Edit"}
                </Button>
            </CardFooter>

        </Card>
    );
}