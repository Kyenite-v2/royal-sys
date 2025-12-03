import { ReactNode } from "react";
import {
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
    SidebarGroupLabel, SidebarHeader, SidebarInset,
    SidebarMenuButton, SidebarMenuItem, SidebarProvider
} from "../ui/sidebar";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const sidebarData = [{
    name: "User Management",
    path: "/admin/user_management"
}, {
    name: "Category",
    path: "/admin/category_management"
}, {
    name: "Candidates",
    path: "/admin/candidate_management"
}, {
    name: "Show Results",
    path: "/admin/results"
}]

export default function AdminSidebarMenu({ children }: { children: ReactNode }) {
    const router = useRouter();

    async function signOutHandler() {
        const res = await fetch("/api/server/auth/logout");

        const data = await res.json();
        if (res.status !== 200) {
            console.error(data.errorText);
            toast.error(data.errorText || "Failed to log out.");
            return;
        } else {
            router.push("/");
        }
    }

    return (
        <SidebarProvided>
            <Sidebar>
                <SidebarContent className="bg-[#0A0A0F] text-gray-100 border-r border-[#1F1A2E]">

                    {/* Header */}
                    <SidebarHeader className="text-[#C9A86A] text-xl font-semibold tracking-wide">
                        Royalty
                    </SidebarHeader>

                    <SidebarGroup>
                        <SidebarGroupLabel className="text-[#8B6F47]">Administrative</SidebarGroupLabel>

                        <SidebarGroupContent>
                            {
                                sidebarData && sidebarData.map((item, i) => {
                                    return (
                                        <Link href={item.path} key={i}>
                                            <SidebarMenuButton className="hover:bg-[#1A102A] transition-colors duration-200 rounded-lg">
                                                <SidebarMenuItem className="text-gray-200">
                                                    {item.name}
                                                </SidebarMenuItem>
                                            </SidebarMenuButton>
                                        </Link>
                                    )
                                })
                            }
                        </SidebarGroupContent>
                    </SidebarGroup>

                </SidebarContent>
                <SidebarFooter className="bg-[#0A0A0F] border-t border-[#1F1A2E] p-4">
                    <SidebarMenuButton className="hover:bg-[#1A102A] transition-colors duration-200 rounded-lg" onClick={signOutHandler}>
                        <SidebarMenuItem className="text-gray-200">
                            Log out
                        </SidebarMenuItem>
                    </SidebarMenuButton>
                </SidebarFooter>
            </Sidebar>

            <SidebarInset className="bg-linear-to-br from-[#0F0A1A] to-[#150F28] text-purple-200">
                <div className="p-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvided>
    );
}

function SidebarProvided({ children }: { children: ReactNode }) {
    return <SidebarProvider>{children}</SidebarProvider>;
}