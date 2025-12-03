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
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";

type CandidatesProps = {
    id: string;
    year: string;
    role: string;
    candidate_no: number;
    candidate_name: string;
    image_url: string;
}

type YearProps = {
    year: string;
    priority: boolean;
};

export default function CategoryManagementUI() {
    const [years, setYears] = useState<YearProps[]>([]);
    const [candidates, setCandidates] = useState<CandidatesProps[]>([]);

    const [year, setYear] = useState<string>("");
    const [candidateRole, setCandidateRole] = useState<string>("");
    const [candidateNo, setCandidateNo] = useState<string>("");
    const [candidateName, setCandidateName] = useState<string>("");
    const [candidateImage, setCandidateImage] = useState<File | null>(null);

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
        async function fetchCandidates() {
            const res = await fetch(`/api/server/admin/candidates?year=${year}`);

            const categories = await res.json();
            if (res.status !== 200) {
                return
            }

            setCandidates(categories);
        }

        fetchCandidates();
    }, [year])

    async function fetchCandidates() {
        const res = await fetch(`/api/server/admin/candidates?year=${year}`);

        const categories = await res.json();
        if (res.status !== 200) {
            return
        }

        setCandidates(categories);
    }

    const handleCreateCategory = async () => {
        if (!year) {
            toast.error("Please select a year.", { position: "top-right" });
            return
        }

        if (!candidateNo || !candidateRole || !candidateName || !candidateImage) {
            toast.error("Please fill in all required fields.", { position: "top-right" });
            return
        }

        const formData = new FormData();
        formData.append("year", year);
        formData.append("role", candidateRole);
        formData.append("candidate_no", candidateNo);
        formData.append("candidate_name", candidateName);
        formData.append("candidate_image", candidateImage);

        const res = await fetch("/api/server/admin/candidates", {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        if (res.status !== 200) {
            toast.error(data.errorText, { position: "top-right" });
            return
        }

        toast.success("Candidate created successfully.", { position: "top-right" });
        setOpen(false);
        fetchCandidates();
        clearForm();
    }

    const handleUpdateCandidate= async () => {
        if (!year) {
            toast.error("Please select a year.", { position: "top-right" });
            return
        }

        if (!updateId || !candidateRole || !candidateNo || !candidateName || !candidateImage) {
            toast.error("Please fill in all required fields.", { position: "top-right" });
            return
        }

        const formData = new FormData();
        formData.append("id", updateId);
        formData.append("year", year);
        formData.append("role", candidateRole);
        formData.append("candidate_no", candidateNo);
        formData.append("candidate_name", candidateName);
        formData.append("candidate_image", candidateImage);

        const res = await fetch("/api/server/admin/candidates", {
            method: "PUT",
            body: formData
        });

        const data = await res.json();
        if (res.status !== 200) {
            toast.error(data.errorText, { position: "top-right" });
            return
        }

        toast.success("Candidate updated successfully.", { position: "top-right" });
        setOpen(false);
        fetchCandidates();
        clearForm();
    }

    const isOnUpdate = (value: boolean, candidate: CandidatesProps | null) => {
        if (!value || !candidate) {
            setOnUpdate(false);
            setUpdateId("");
            return;
        }

        clearForm();

        setOnUpdate(true);
        if (value) {
            setUpdateId(candidate.id);
            setCandidateRole(candidate.role);
            setCandidateNo(candidate.candidate_no.toString());
            setCandidateName(candidate.candidate_name);
            setCandidateImage(null);
            setOpen(true);
        } else {
            setUpdateId("");
            setOpen(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this candidate? This action cannot be undone.")) {
            return;
        }

        const res = await fetch(`/api/server/admin/candidates`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id })
        });

        if (res.status !== 200) {
            toast.error("Failed to delete candidate.", { position: "top-right" });
            return
        }

        toast.success("Candidate deleted successfully.", { position: "top-right" });
        fetchCandidates();
    }

    function clearForm() {
        setCandidateNo("");
        setCandidateRole("");
        setCandidateName("");
        setCandidateImage(null);
    }

    return (
        <AdminSidebarMenu>
            <div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center justify-center gap-4">
                        <SidebarTrigger className="block md:hidden" />
                        <h1 className="text-2xl font-bold">Candidate Management</h1>
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
                                    Add Candidate
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{onUpdate ? "Create" : "Update"} Category</DialogTitle>
                                    <DialogDescription>
                                        Fill in the candidate details for the pageant.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                    {/* Candidate No */}
                                    <div className="space-y-2">
                                        <Label htmlFor="candidateNo">Candidate No. <span className="text-red-600">*</span></Label>
                                        <Input
                                            id="candidateNo"
                                            type="number"
                                            placeholder=""
                                            value={candidateNo || ''}
                                            onChange={(e) => setCandidateNo(e.target.value)}
                                            min={1}
                                        />
                                    </div>

                                    {/* Candidate Role */}
                                    <div className="space-y-2">
                                        <Label htmlFor="candidateRole">Candidate Role <span className="text-red-600">*</span></Label>
                                        <Select value={candidateRole} onValueChange={(e) => { setCandidateRole(e) }}>
                                            <SelectTrigger className="bg-white text-black w-full">
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent align="center" className="text-center">
                                                <SelectItem value="Mr">Mr.</SelectItem>
                                                <SelectItem value="Ms">Ms.</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Candidate Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="candidateName">Candidate Name <span className="text-red-600">*</span></Label>
                                        <Input
                                            id="candidateName"
                                            type="text"
                                            placeholder="Juan Dela Cruz"
                                            value={candidateName}
                                            onChange={(e) => setCandidateName(e.target.value)}
                                            autoComplete="off"
                                        />
                                    </div>

                                    {/* Image Upload */}
                                    <div className="space-y-2">
                                        <Label htmlFor="candidateImage">Candidate Image <span className="text-zinc-500 font-light">(1000wx750h JPEG)</span> <span className="text-red-600">*</span></Label>
                                        <Input
                                            id="candidateImage"
                                            name={candidateName}
                                            type="file"
                                            accept="image/jpeg"
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
                                    <Button type="submit" className="rounded-xl px-6 font-medium shadow-sm hover:shadow-md transition-all" onClick={onUpdate ? handleUpdateCandidate : handleCreateCategory}>
                                        {onUpdate ? "Update" : "Create"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Separator className="px-4 my-4" />

                {/* Table */}
                <div className="overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-gray-50 w-10">Candidate No.</TableHead>
                                <TableHead className="text-gray-50 w-5">Image</TableHead>
                                <TableHead className="text-gray-50 w-10">Candidate Role</TableHead>
                                <TableHead className="text-gray-50">Candidate Name</TableHead>
                                <TableHead className="text-gray-50 w-10 text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Example row structure */}
                            {
                                candidates && candidates.map((candidate, i) => {
                                    return (
                                        <TableRow key={i}>
                                            <TableCell className="font-bold text-center">{candidate.candidate_no}</TableCell>
                                            <TableCell>
                                                <Avatar className="mx-auto border border-gray-300">
                                                    <AvatarFallback>{candidate.candidate_no}</AvatarFallback>
                                                    <AvatarImage src={candidate.image_url} alt={candidate.candidate_name} />
                                                </Avatar>
                                            </TableCell>
                                            <TableCell>{candidate.role}.</TableCell>
                                            <TableCell>{candidate.candidate_name}</TableCell>
                                            <TableCell>
                                                <div className="flex justify-center items-center gap-2">
                                                    <Button variant="secondary" onClick={() => { isOnUpdate(true, candidate) }}>
                                                        <Edit size={12} />
                                                    </Button>

                                                    <Button variant="destructive" onClick={() => { handleDelete(candidate.id) }}>
                                                        <Trash size={12} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            }
                            {
                                candidates.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                                            No candidates found.
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