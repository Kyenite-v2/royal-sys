'use client'
import AdminSidebarMenu from "@/components/built-in/admin-sidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash } from "lucide-react";
import { useEffect, useState } from "react";

type UserProps = {
    id: string;
    user_id: string;
    username: string;
    email: string;
    role: string;
    created_at: string;
}

type UsersProps = UserProps[];

export default function Page() {
    const [users, setUsers] = useState<UsersProps>([]);

    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [role, setRole] = useState<string>("");
    const [error, setError] = useState<string>("");

    const [open1, setOpen1] = useState<boolean>(false);
    const [open2, setOpen2] = useState<boolean>(false);

    // Update Form
    const [username2, setUsername2] = useState<string>("");
    const [email2, setEmail2] = useState<string>("");
    const [password2, setPassword2] = useState<string>("");
    const [role2, setRole2] = useState<string>("");
    const [error2, setError2] = useState<string>("");

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetch("/api/server/admin/users");
                const data = await res.json();

                if (res.status === 200) {
                    setUsers(data); // Safe: now inside async function
                } else {
                    console.error(data.errorText);
                }
            } catch (err) {
                console.error(err);
            }
        }

        fetchUsers();
    }, [])

    async function loadUsers() {
        const res = await fetch("/api/server/admin/users");

        const data = await res.json();
        if (res.status !== 200) {
            console.log(data.errorText);
            return
        }

        setUsers(data);
    }

    const createButton = async () => {
        setError("");

        if (email.length === 0 || username.length === 0 || password.length === 0 || role.length === 0) {
            return setError("Please fill out all the required input.")
        }

        if (email.split("@")[1] !== "magsaysaycollege.edu.ph") {
            return setError("Please use Magsaysay College email only.")
        }

        if (password.length < 8) {
            return setError("Password length must be equal or greater than 8 characters.")
        }

        const res = await fetch("/api/server/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, role })
        });

        const data = await res.json();
        if (res.status !== 200) {
            return setError(data.errorText);
        }

        clearAll();
        setOpen1(false);

        loadUsers();
    }

    async function updateButton(item: UserProps) {
        setError2("");

        if (email2.length === 0 || username2.length === 0 || password2.length === 0 || role2.length === 0) {
            return setError2("Please fill out all the required input.")
        }

        if (email2.split("@")[1] !== "magsaysaycollege.edu.ph") {
            return setError2("Please use Magsaysay College email only.")
        }

        if (password2.length < 8) {
            return setError2("Password length must be equal or greater than 8 characters.")
        }

        const res = await fetch("/api/server/admin/users", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: item.user_id, username: username2, email: email2, password: password2, role: role2 })
        });

        const data = await res.json();
        if (res.status !== 200) {
            return setError2(data.errorText);
        }

        clearAll();
        setOpen2(false);

        loadUsers();
    }

    async function deleteUser(id: string) {
        const res = await fetch("/api/server/admin/users", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id })
        });

        const data = await res.json();
        if (res.status !== 200) {
            console.error("Error: ", data.errorText);
        }
    }

    function retrieveData(user: UserProps) {
        setUsername2(user.username);
        setEmail2(user.email);
        setRole2(user.role)
    }

    function clearAll() {
        setUsername("")
        setEmail("")
        setPassword("")
        setRole("")
        setError("")

        setUsername2("")
        setEmail2("")
        setPassword2("")
        setRole2("")
        setError2("")
    }

    return (
        <AdminSidebarMenu>
            <div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center justify-center gap-4">
                        <SidebarTrigger className="block md:hidden"/>
                        <h1 className="text-2xl font-bold">User Management</h1>
                    </div>
                    <div>
                        <form>
                            <Dialog open={open1} onOpenChange={setOpen1}>
                                <DialogTrigger asChild>
                                    <Button className="bg-purple-500 hover:bg-purple-600" onClick={() => { setOpen1(!open1) }}>
                                        Create User
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Create login credential
                                        </DialogTitle>
                                        <DialogDescription>
                                            Fill up user&apos;s login credentials.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username <span className="text-red-600">*</span></Label>
                                            <Input id="username" type="text" placeholder="Judge_101" autoComplete="off" onKeyDown={(e) => { if (e.key === " ") e.preventDefault(); }} value={username} onChange={(e) => { setUsername(e.target.value) }} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email <span className="text-red-600">*</span></Label>
                                            <Input id="email" type="email" placeholder="user@company.com" autoComplete="off" value={email} onChange={(e) => { setEmail(e.target.value) }} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password <span className="text-red-600">*</span></Label>
                                            <Input id="password" type="password" placeholder="*******" autoComplete="off" minLength={8} value={password} onChange={(e) => { setPassword(e.target.value) }} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role <span className="text-red-600">*</span></Label>
                                            <Select value={role} onValueChange={(e) => { setRole(e) }}>
                                                <SelectTrigger className="w-full" id="role">
                                                    <SelectValue placeholder={"Select role"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Admin">Admin</SelectItem>
                                                    <SelectItem value="Judge">Judge</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    {
                                        error.length > 0 && (
                                            <div className="py-6 px-4 border border-red-600 bg-red-100 rounded-xl">
                                                <p className="text-center text-sm text-red-600">{error}</p>
                                            </div>
                                        )
                                    }
                                    <DialogFooter className="flex items-center justify-end gap-4 mt-4 border-t pt-4">
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline" className="rounded-xl px-5 hover:bg-accent transition-all" onClick={() => { clearAll() }}>
                                                Close
                                            </Button>
                                        </DialogClose>
                                        <Button type="submit" onClick={createButton} className="rounded-xl px-6 font-medium shadow-sm hover:shadow-md transition-all">
                                            Create
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </form>
                    </div>
                </div>
                <Separator className="px-4 my-4" />
            </div>
            <div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-white">
                                Username
                            </TableHead>
                            <TableHead className="text-white">
                                Email
                            </TableHead>
                            <TableHead className="text-white">
                                Role
                            </TableHead>
                            <TableHead className="text-white">
                                Created at
                            </TableHead>
                            <TableHead className="text-white">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            users.length > 0 && (
                                users.map((item, i) => {
                                    return (
                                        <TableRow key={i}>
                                            <TableCell>
                                                {item.username}
                                            </TableCell>
                                            <TableCell>
                                                {item.email}
                                            </TableCell>
                                            <TableCell>
                                                {item.role}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center items-center gap-2">
                                                    <Dialog open={open2} onOpenChange={setOpen2}>
                                                        <DialogTrigger asChild>
                                                            <Button variant={"secondary"} onClick={() => { retrieveData(item) }}>
                                                                <Edit size={12} />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>
                                                                    Update login credential
                                                                </DialogTitle>
                                                                <DialogDescription>
                                                                    Fill up user&apos;s login credentials.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="username">Username <span className="text-red-600">*</span></Label>
                                                                    <Input id="username" type="text" placeholder="Judge_101" autoComplete="off" onKeyDown={(e) => { if (e.key === " ") e.preventDefault(); }} value={username2} onChange={(e) => { setUsername2(e.target.value) }} required />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="email">Email <span className="text-red-600">*</span></Label>
                                                                    <Input id="email" type="email" placeholder="user@company.com" autoComplete="off" value={email2} onChange={(e) => { setEmail2(e.target.value) }} required />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="password">Password <span className="text-red-600">*</span></Label>
                                                                    <Input id="password" type="password" placeholder="*******" autoComplete="off" minLength={8} value={password2} onChange={(e) => { setPassword2(e.target.value) }} required />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="role">Role <span className="text-red-600">*</span></Label>
                                                                    <Select value={role2} onValueChange={(e) => { setRole2(e) }}>
                                                                        <SelectTrigger className="w-full" id="role">
                                                                            <SelectValue placeholder={"Select role"} />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="Admin">Admin</SelectItem>
                                                                            <SelectItem value="Judge">Judge</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                            {
                                                                error2.length > 0 && (
                                                                    <div className="py-6 px-4 border border-red-600 bg-red-100 rounded-xl">
                                                                        <p className="text-center text-sm text-red-600">{error2}</p>
                                                                    </div>
                                                                )
                                                            }
                                                            <DialogFooter className="flex items-center justify-end gap-4 mt-4 border-t pt-4">
                                                                <DialogClose asChild>
                                                                    <Button type="button" variant="outline" className="rounded-xl px-5 hover:bg-accent transition-all">
                                                                        Close
                                                                    </Button>
                                                                </DialogClose>
                                                                <Button type="submit" onClick={() => { updateButton(item) }} className="rounded-xl px-6 font-medium shadow-sm hover:shadow-md transition-all">
                                                                    Update
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>

                                                    {/* Delete */}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant={"destructive"}>
                                                                <Trash size={12} />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    Are you sure to delete this user?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    {item.email}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>
                                                                    Cancel
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction asChild>
                                                                    <Button onClick={() => { deleteUser(item.user_id) }}>
                                                                        Delete
                                                                    </Button>
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )
                        }
                    </TableBody>
                </Table>
            </div>
        </AdminSidebarMenu>
    )
}