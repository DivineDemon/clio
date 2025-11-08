"use client";

import { ChevronUp, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import Logo from "@/assets/img/clio.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SIDEBAR_ITEMS } from "@/lib/constants";
import { logout } from "@/lib/server-actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem as DropdownMenuPrimitiveItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface AppSidebarProps {
  session: Session | null;
}

const AppSidebar = ({ session }: AppSidebarProps) => {
  const pathname = usePathname();
  const displayName = session?.user?.name ?? session?.user?.email ?? "Signed in user";
  const avatar = session?.user?.image;

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
                isActive={pathname.startsWith(item.path)}
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="gap-3">
                    <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border">
                      {avatar ? (
                        <Image src={avatar} alt={displayName ?? "User avatar"} fill className="shrink-0 rounded-full" />
                      ) : (
                        <span className="font-semibold text-sm uppercase">{displayName?.slice(0, 2) ?? "U"}</span>
                      )}
                    </div>
                    <span className="truncate font-semibold text-sm leading-tight">{displayName}</span>
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-[239px]">
                  <DropdownMenuPrimitiveItem asChild variant="destructive">
                    <button type="button" onClick={() => logout()} className="flex w-full items-center gap-2">
                      <LogOut className="size-4" />
                      <span>Logout</span>
                    </button>
                  </DropdownMenuPrimitiveItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
