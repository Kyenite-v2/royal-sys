'use client'

import AdminSidebarMenu from "@/components/built-in/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useEffect, useState } from "react";

type YearEntry = {
    id: number;
    year: string;
    priority: boolean;
    created_at: string;
}

export default function Page() {
    const [years, setYears] = useState<YearEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [yearName, setYearName] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        loadYears();
    }, []);

    async function loadYears() {
        setLoading(true);
        try {
            const res = await fetch("/api/server/admin/years");
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setYears(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function createYear() {
        if (!yearName.trim()) return;

        const res = await fetch("/api/server/admin/years", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: yearName }),
        });
        if (!res.ok) {
            console.error(await res.text());
            return;
        }
        setYearName("");
        setDialogOpen(false);
        loadYears();
    }

    async function togglePriority(id: number | string) {
        const yearId = Number(id); // Ensure it’s a number
        if (isNaN(yearId)) {
            console.error("Invalid year ID", id);
            return;
        }

        const res = await fetch(`/api/server/admin/years/${yearId}/priority`, { method: "PUT" });
        
        const data = await res.json();

        if (res.status !== 200) {
            console.error(data.error);
            return;
        }
        
        loadYears();
    }

    return (
        <AdminSidebarMenu>
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Year Management</h1>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Create Year</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create a new year</DialogTitle>
                                <DialogDescription>
                                    Enter the year name (e.g., 2025-2026)
                                </DialogDescription>
                            </DialogHeader>
                            <div className="my-4">
                                <Label htmlFor="year">Year Name</Label>
                                <Input id="year" value={yearName} onChange={e => setYearName(e.target.value)} />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={createYear}>Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table className="text-gray-400">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-200">School Year</TableHead>
                            <TableHead className="text-gray-200">Priority</TableHead>
                            <TableHead className="text-gray-200">Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {years.map(y => (
                            <TableRow key={y.id} className="text-gray-200">
                                <TableCell>{y.year}</TableCell>
                                <TableCell>
                                    <input
                                        type="checkbox"
                                        checked={y.priority}
                                        onChange={() => togglePriority(y.id)}
                                    />
                                </TableCell>
                                <TableCell>{new Date(y.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {loading && <p className="text-gray-200 mt-2">Loading...</p>}
            </div>
        </AdminSidebarMenu>
    )
}
