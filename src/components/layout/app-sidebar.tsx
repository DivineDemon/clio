"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/assets/img/clio.png";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SIDEBAR_ITEMS } from "@/lib/constants";

const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r bg-card text-card-foreground" collapsible="none">
      <SidebarHeader className="border-b p-0">
        <div className="flex h-[63px] items-start justify-start gap-3.5 p-3.5">
          <Image src={Logo} alt="logo" width={100} height={100} className="w-6" />
          <span className="mt-0.5 flex-1 text-left font-semibold text-[36px] leading-[36px]">Clio</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex w-full flex-col items-start justify-start p-3.5">
        <SidebarMenu>
          {SIDEBAR_ITEMS.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.path}
                className="justify-start gap-2 transition-all duration-200 hover:bg-secondary/20 hover:text-secondary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:hover:bg-primary data-[active=true]:hover:text-primary-foreground data-[active=true]:hover:opacity-75"
              >
                <Link href={item.path}>
                  <item.icon className="size-4" />
                  <span className="mt-[3px] truncate">{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
