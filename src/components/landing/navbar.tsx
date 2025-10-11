import Image from "next/image";
import Logo from "@/assets/img/clio.png";
import { Button } from "../ui/button";

const Navbar = () => {
  return (
    <nav className="fixed inset-x-0 top-5 z-[1] mx-auto flex w-full max-w-screen-lg items-center justify-between rounded-full border border-primary/50 bg-black/10 pr-3 shadow backdrop-blur-sm">
      <Image src={Logo} alt="logo" width={100} height={100} className="w-20" />
      <Button size="sm" variant="default" className="rounded-full">
        Get Started
      </Button>
    </nav>
  );
};

export default Navbar;
