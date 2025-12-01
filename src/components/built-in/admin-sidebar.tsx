import { ReactNode } from "react";
import {
    Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
    SidebarGroupLabel, SidebarHeader, SidebarInset,
    SidebarMenuButton, SidebarMenuItem, SidebarProvider
} from "../ui/sidebar";
import Link from "next/link";

const sidebarData = [{
    name: "User Management",
    path: "/admin/users"
}, {
    name: "Category",
    path: "/admin/categories"
}, {
    name: "Candidates",
    path: "/admin/candidates"
}, {
    name: "Show Results",
    path: "/admin/results"
}]

export default function AdminSidebarMenu({ children }: { children: ReactNode }) {
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
            </Sidebar>

            <SidebarInset className="bg-gradient-to-br from-[#0F0A1A] to-[#150F28] text-purple-200">
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