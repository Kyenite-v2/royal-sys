import { ReactNode, useEffect, useState } from "react";
import {
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
    SidebarGroupLabel, SidebarHeader, SidebarInset,
    SidebarMenuButton, SidebarMenuItem, SidebarProvider
} from "../ui/sidebar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type SidebarMenuProps = {
    id: number;
    name: string;
}

type YearProps = {
    year: string;
    priority: boolean;
};

export default function SidebarMenu({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [data, setData] = useState<SidebarMenuProps[]>([]);
    const [years, setYears] = useState<YearProps[]>([]);
    const [year, setYear] = useState<string>("");

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

    useEffect(() => {
        async function loadYears() {
            const res = await fetch("/api/server/admin/year");
            const data = await res.json();
            if (res.status !== 200) return;

            const yearsData: YearProps[] = data;
            setYears(yearsData);

            const defaultYear = yearsData.find(item => item.priority === true);
            if (defaultYear) {
                setYear(defaultYear.year); // set the default year AFTER years are loaded
            }
        }

        loadYears();
    }, []);

    useEffect(() => {
        async function fetchCategories() {
            const res = await fetch(`/api/server/index/categories?year=${year}`);

            const categories = await res.json();
            if (res.status !== 200) {
                return
            }

            setData(categories);
        }

        fetchCategories();
    }, [year])

    return (
        <SidebarProvided>
            <Sidebar>
                <SidebarContent className="bg-[#0A0A0F] text-gray-100 border-r border-[#1F1A2E]">

                    {/* Header */}
                    <SidebarHeader className="text-[#C9A86A] text-xl font-semibold tracking-wide">
                        Royalty
                    </SidebarHeader>

                    <SidebarGroup>
                        <SidebarGroupLabel className="text-[#8B6F47]">Categories</SidebarGroupLabel>

                        <SidebarGroupContent>
                            {
                                data && data.map((item, i) => {
                                    return (
                                        <SidebarMenuButton
                                            key={item.id}
                                            onClick={() => {
                                                router.push(`/index/candidates?category=${item.id}`);
                                                router.refresh();
                                            }}
                                            className="hover:bg-[#1A102A] transition-colors duration-200 rounded-lg"
                                        >
                                            <SidebarMenuItem className="text-gray-200">
                                                {item.name}
                                            </SidebarMenuItem>
                                        </SidebarMenuButton>
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