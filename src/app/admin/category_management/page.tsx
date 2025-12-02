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
    const [categoryName, setCatergoryName] = useState<string>("");
    const [overallPercentage, setOverallPercentage] = useState<number | null>(null);
    const [criteriaCount, setCriteriaCount] = useState<{ criteria_name: string, percentage: number | null }[]>([]);

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

    async function fetchCategories() {
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

        if (!categoryName || !overallPercentage || criteriaCount.length === 0) {
            toast.error("Please fill in all required fields.", { position: "top-right" });
            return
        }

        if (criteriaCount.some(c => !c.criteria_name || c.percentage === null)) {
            toast.error("Please fill in all criteria fields.", { position: "top-right" });
            return
        }

        if (criteriaCount.reduce((sum, item) => sum + (item.percentage || 0), 0) !== 100) {
            toast.error("Total criteria percentage must equal 100%.", { position: "top-right" });
            return
        }

        const res = await fetch("/api/server/admin/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: updateId,
                category_name: categoryName,
                percentage: overallPercentage,
                criteria: criteriaCount
            })
        });

        const data = await res.json();
        if (res.status !== 200) {
            console.log(data.errorText)
            toast.error("Failed to create category. Please try again.", { position: "top-right" });
            return
        }

        clearForm();
        setOpen(false);
        toast.success("Category created successfully!", { position: "top-right" });
        fetchCategories();
    }

    const handleUpdateCategory = async () => {
        if (!year) {
            toast.error("Please select a year.", { position: "top-right" });
            return
        }

        if (!categoryName || !overallPercentage || criteriaCount.length === 0) {
            toast.error("Please fill in all required fields.", { position: "top-right" });
            return
        }

        if (criteriaCount.some(c => !c.criteria_name || c.percentage === null)) {
            toast.error("Please fill in all criteria fields.", { position: "top-right" });
            return
        }

        if (criteriaCount.reduce((sum, item) => sum + (item.percentage || 0), 0) !== 100) {
            toast.error("Total criteria percentage must equal 100%.", { position: "top-right" });
            return
        }

        const res = await fetch("/api/server/admin/categories", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: updateId,
                category_name: categoryName,
                percentage: overallPercentage,
                criteria: criteriaCount
            })
        });

        const data = await res.json();
        if (res.status !== 200) {
            console.log(data.errorText)
            toast.error("Failed to create category. Please try again.", { position: "top-right" });
            return
        }

        clearForm();
        setOpen(false);
        toast.success("Category updated successfully!", { position: "top-right" });
        fetchCategories()
    }

    const isOnUpdate = (value: boolean, data: { id: string, name: string, percentage: number, criteria: { criteria_name: string; percentage: number }[] } | null) => {
        setOnUpdate(value);
        clearForm();

        if (value && data) {
            setUpdateId(data.id);
            setCatergoryName(data.name);
            setOverallPercentage(data.percentage);
            setCriteriaCount(data.criteria);

            setOpen(true);
        } else {
            clearForm();
            setOpen(true);
        }
    }

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/server/admin/categories`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });

        const data = await res.json();
        if (res.status !== 200) {
            console.log(data.errorText)
            toast.error("Failed to delete category. Please try again.", { position: "top-right" });
            return
        }

        toast.success("Category deleted successfully!", { position: "top-right" });
        fetchCategories()
    }

    function clearForm() {
        setCatergoryName("");
        setOverallPercentage(null);
        setCriteriaCount([]);
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

                                <div className="space-y-4 overflow-y-auto max-h-[60vh] pb-2">

                                    {/* Category Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="categoryName">Category Name <span className="text-red-600">*</span></Label>
                                        <Input id="categoryName" type="text" placeholder="Best in Talent" value={categoryName} onChange={(e) => { setCatergoryName(e.target.value) }} autoComplete="off" />
                                    </div>

                                    {/* Overall Percentage */}
                                    <div className="space-y-2">
                                        <Label htmlFor="overallPercentage">Overall Percentage <span className="text-red-600">*</span></Label>
                                        <Input id="overallPercentage" type="number" placeholder="50" value={overallPercentage || ''} onChange={(e) => { setOverallPercentage(e.target.valueAsNumber) }} min={0} max={100} />
                                    </div>

                                    {/* Criteria Separator */}
                                    <Separator className="my-4" />
                                    <h2 className="font-bold">Criteria</h2>

                                    {/* Criteria */}
                                    {
                                        criteriaCount.length !== 0 && criteriaCount.map((_, index) => (
                                            <div key={index}>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Input id={`criteria_name${index}`} type="text" placeholder="Criteria Name" value={_.criteria_name} autoComplete="off"
                                                        onChange={(e) => {
                                                            const newCriteria = [...criteriaCount];
                                                            newCriteria[index].criteria_name = e.target.value;
                                                            setCriteriaCount(newCriteria);
                                                        }}
                                                    />
                                                    <Input id={`criteria_percentage${index}`} type="number" placeholder="Criteria Percentage" value={_.percentage || ''}
                                                        onChange={(e) => {
                                                            const newCriteria = [...criteriaCount];
                                                            newCriteria[index].percentage = e.target.valueAsNumber > 100 ? 100 : e.target.valueAsNumber < 0 ? 0 : e.target.valueAsNumber;
                                                            setCriteriaCount(newCriteria);
                                                        }}
                                                        min={0} max={100} />
                                                </div>
                                            </div>
                                        ))
                                    }

                                    <div>
                                        <p className="text-center">
                                            <span className="me-2">
                                                Total Percentage:
                                            </span>
                                            <span className={`font-semibold ${criteriaCount.reduce((sum, item) => sum + (item.percentage || 0), 0) === 100 ? 'text-green-500' : 'text-red-500'}`}>
                                                {criteriaCount.reduce((sum, item) => sum + (item.percentage || 0), 0)}%
                                            </span>
                                        </p>
                                    </div>

                                    <div className={`grid ${criteriaCount.length > 0 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mt-2`}>
                                        {
                                            criteriaCount.length > 0 && (
                                                <Button className="w-full" variant={"destructive"}
                                                    onClick={() => {
                                                        setCriteriaCount(prev => prev.slice(0, -1));
                                                    }}
                                                >
                                                    <TrashIcon size={16} />
                                                </Button>
                                            )
                                        }
                                        <Button className="w-full bg-green-600 hover:bg-green-700" variant={"outline"}
                                            onClick={() => {
                                                const totalPercentage = criteriaCount.reduce((sum, item) => sum + (item.percentage || 0), 0);
                                                if (totalPercentage > 100) {
                                                    toast("Warning!", {
                                                        description: "Total criteria percentage exceeds 100%. Please adjust before removing.",
                                                        duration: 1500,
                                                        position: "top-right",
                                                    })
                                                    return;
                                                }
                                                setCriteriaCount(prev => [...prev, { criteria_name: "", percentage: null }])
                                            }}>
                                            <Plus color="white" size={16} />
                                        </Button>
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