"use client";

import { usePathname } from "next/navigation";
import ModeToggle from "../mode-toggle";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex h-16 w-full items-center justify-between border-b bg-sidebar p-3.5">
      <span className="font-bold text-lg capitalize">{pathname.split("/")[1]}</span>
      <ModeToggle />
    </nav>
  );
};

export default Navbar;
