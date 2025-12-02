'use client'
import AdminSidebarMenu from "@/components/built-in/admin-sidebar";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Plus, Trash, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type CategoryProps = {
    id: string;
    name: string;
    year: string;
    percentage: number;
    criteria: { criteria_name: string; percentage: number }[];
}

type YearProps = {
    year: string;
    priority: boolean;
};

export default function CategoryManagementUI() {
    const [years, setYears] = useState<YearProps[]>([]);
    const [categories, setCategories] = useState<CategoryProps[]>([]);

    const [year, setYear] = useState<string>("");
    const [candidateNo, setCandidateNo] = useState<string>("");
    const [candidateName, setCandidateName] = useState<number | null>(null);
    const [candidateImage, setCandidateImage] = useState<{ criteria_name: string, percentage: number | null }[]>([]);

    const [open, setOpen] = useState<boolean>(false);
    const [onUpdate, setOnUpdate] = useState<boolean>(false);
    const [updateId, setUpdateId] = useState<string>("");

    useEffect(() => {
        async function loadYears() {
            const res = await fetch("/api/server/admin/year");
            const data = await res.json();
            if (res.status !== 200) {
                return
            }

            const yearsData: YearProps[] = data;
            setYears(data);

            const defaultYear = yearsData.filter(item => item.priority === true);

            if (defaultYear.length > 0) {
                setYear(defaultYear[0].year);
            }
        }

        loadYears();
    }, [])

    useEffect(() => {
        async function fetchCategories() {
            const res = await fetch(`/api/server/admin/categories?year=${year}`);

            const categories = await res.json();
            if (res.status !== 200) {
                return
            }

            setCategories(categories);
        }

        fetchCategories();
    }, [year])

    async function fetchCandidates() {
        const res = await fetch(`/api/server/admin/categories?year=${year}`);

        const categories = await res.json();
        if (res.status !== 200) {
            return
        }

        setCategories(categories);
    }

    const handleCreateCategory = async () => {
        if (!year) {
            toast.error("Please select a year.", { position: "top-right" });
            return
        }

        if (!candidateNo || !candidateName || !candidateImage) {
            toast.error("Please fill in all required fields.", { position: "top-right" });
            return
        }

        
    }

    const handleUpdateCategory = async () => {
        if (!year) {
            toast.error("Please select a year.", { position: "top-right" });
            return
        }

        if (!candidateNo || !candidateName || !candidateImage) {
            toast.error("Please fill in all required fields.", { position: "top-right" });
            return
        }

        
    }

    const isOnUpdate = (value: boolean, data: { id: string, name: string, percentage: number, criteria: { criteria_name: string; percentage: number }[] } | null) => {
        
    }

    const handleDelete = async (id: string) => {
        
    }

    function clearForm() {
        
    }

    return (
        <AdminSidebarMenu>
            <div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center justify-center gap-4">
                        <SidebarTrigger className="block md:hidden" />
                        <h1 className="text-2xl font-bold">Category Management</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Select value={year} onValueChange={(e) => { setYear(e) }}>
                            <SelectTrigger className="bg-white text-black">
                                <SelectValue placeholder="Filter by Year" />
                            </SelectTrigger>
                            <SelectContent align="center" className="text-center">
                                {
                                    years.map((item, i) => {
                                        return (
                                            <SelectItem key={i} value={item.year}>{item.year}</SelectItem>
                                        )
                                    })
                                }
                            </SelectContent>
                        </Select>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-purple-500 hover:bg-purple-600" onClick={() => {
                                    clearForm();
                                    isOnUpdate(false, null);
                                }}>
                                    Create Category
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{onUpdate ? "Create" : "Update"} Category</DialogTitle>
                                    <DialogDescription>
                                        Fill in the category details for the pageant.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                    {/* Candidate No */}
                                    <div className="space-y-2">
                                        <Label htmlFor="candidateNo">Candidate No. <span className="text-red-600">*</span></Label>
                                        <Input
                                            id="candidateNo"
                                            type="number"
                                            placeholder="1"
                                            value={candidateNo || ''}
                                            onChange={(e) => setCandidateNo(e.target.valueAsNumber)}
                                            min={1}
                                        />
                                    </div>

                                    {/* Candidate Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="candidateName">Candidate Name <span className="text-red-600">*</span></Label>
                                        <Input
                                            id="candidateName"
                                            type="text"
                                            placeholder="John Doe"
                                            value={candidateName}
                                            onChange={(e) => setCandidateName(e.target.value)}
                                            autoComplete="off"
                                        />
                                    </div>

                                    {/* Image Upload */}
                                    <div className="space-y-2">
                                        <Label htmlFor="candidateImage">Candidate Image <span className="text-red-600">*</span></Label>
                                        <Input
                                            id="candidateImage"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setCandidateImage(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="flex justify-end gap-4 mt-4 border-t pt-4">
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">
                                            Close
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" className="rounded-xl px-6 font-medium shadow-sm hover:shadow-md transition-all" onClick={onUpdate ? handleUpdateCategory : handleCreateCategory}>
                                        {onUpdate ? "Update" : "Create"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Separator className="px-4 my-4" />

                {/* Table */}
                <div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-gray-50">Category Name</TableHead>
                                <TableHead className="text-gray-50">Year</TableHead>
                                <TableHead className="text-gray-50">Overall Percentage</TableHead>
                                <TableHead className="text-gray-50">Criteria</TableHead>
                                <TableHead className="text-gray-50">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Example row structure */}
                            {
                                categories && categories.map((category, i) => {
                                    return (
                                        <TableRow key={i}>
                                            <TableCell>{category.name}</TableCell>
                                            <TableCell>{category.year}</TableCell>
                                            <TableCell>{category.percentage}%</TableCell>
                                            <TableCell>
                                                <div>
                                                    {category.criteria.map((criteria, idx) => (
                                                        <p key={idx} className="text-sm">
                                                            {criteria.criteria_name} - {criteria.percentage}%
                                                        </p>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center items-center gap-2">
                                                    <Button variant="secondary" onClick={() => { isOnUpdate(true, { id: category.id, name: category.name, percentage: category.percentage, criteria: category.criteria }) }}>
                                                        <Edit size={12} />
                                                    </Button>

                                                    <Button variant="destructive" onClick={() => { handleDelete(category.id) }}>
                                                        <Trash size={12} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            }
                            {
                                categories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                                            No categories found.
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AdminSidebarMenu>
    );
}