"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Logo from "@/assets/img/clio.png";
import GithubLoginButton from "../auth/github-login-button";
import ModeToggle from "../mode-toggle";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: 0.2,
      }}
      className="fixed inset-x-0 top-5 z-[3] mx-auto flex w-[90%] max-w-screen-lg items-center justify-between rounded-full border border-primary/50 bg-primary/50 py-2.5 pr-3 pl-6 shadow backdrop-blur-sm md:w-[95%] xl:w-full dark:bg-black/10"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <Image src={Logo} alt="logo" width={100} height={100} className="w-6" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="flex items-center justify-center gap-2.5"
      >
        <ModeToggle />
        <GithubLoginButton size="sm" className="rounded-full" />
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;
