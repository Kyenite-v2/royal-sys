import { FormEvent, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type CriteriaItem = {
    criteria_name: string;
    percentage: number;
    value: number;
};

type CandidateCardProps = {
    index: number;
    imageUrl: string;
    name: string;
    candidate_no: number;
    criteria: CriteriaItem[];
    isEditing: boolean;
    editingIndex: number | null;
    setEditingIndex: (val: number | null) => void;
};

export default function CandidateCard({
    index,
    imageUrl,
    name,
    candidate_no,
    criteria,
    isEditing,
    editingIndex,
    setEditingIndex
}: CandidateCardProps) {

    const [values, setValues] = useState<string[]>(
        criteria.map(c => c.value.toString())
    );

    const updateValue = (index: number, newVal: string) => {
        let val = parseInt(newVal);

        if (newVal === "") {
            setValues(prev => {
                const copy = [...prev];
                copy[index] = "";
                return copy;
            });
            return;
        }

        if (isNaN(val)) return;
        if (val < 0) val = 0;
        if (val > criteria[index].percentage) val = criteria[index].percentage;

        setValues(prev => {
            const copy = [...prev];
            copy[index] = val.toString();
            return copy;
        });
    };

    return (
        <Card className="bg-[#120D1E] border border-[#2A213A] shadow-lg rounded-2xl text-gray-200">
            <CardHeader className="space-y-3">

                {/* IMAGE */}
                <div className="h-58 rounded-xl overflow-hidden border border-[#302542] bg-[#1E152E]">
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                </div>

                {/* NAME & NUMBER */}
                <div className="w-full flex items-center justify-between text-[#C9A86A] font-semibold">
                    <h1>{name}</h1>
                    <p className="text-sm bg-[#1F162E] py-1 px-3 rounded-lg border border-[#3A2E52]">
                        No. {candidate_no}
                    </p>
                </div>

            </CardHeader>

            <CardContent className="space-y-4">
                {criteria.map((item, i) => (
                    <div key={i} className="grid grid-cols-5 items-center text-sm">
                        <div className="col-span-3">
                            <p>{item.criteria_name}</p>
                        </div>

                        <div className="col-span-1 text-[#C9A86A] font-medium">
                            <p>{item.percentage}%</p>
                        </div>

                        <div className="col-span-1">
                            <Input
                                type="number"
                                min={0}
                                max={item.percentage}
                                value={values[i]}
                                onChange={(e) => updateValue(i, e.target.value)}
                                className="bg-[#1A1228] border-[#3A2E52] text-gray-100 focus-visible:ring-[#C9A86A]"
                            />
                        </div>
                    </div>
                ))}
            </CardContent>

            <CardFooter>
                <Button
                    className={`mx-auto py-4 px-12 ${isEditing ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    type={isEditing ? "submit" : "button"}
                    onClick={() => {
                        if (isEditing) {
                            // Save clicked
                            console.log("Save clicked", values);
                            setEditingIndex(null);
                        } else {
                            // Edit clicked
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