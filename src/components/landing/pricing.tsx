"use client";

import { DollarSign } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Dotted from "@/assets/img/dotted.svg";

const Pricing = () => {
  return (
    <div className="relative flex w-full items-center justify-center overflow-hidden px-5 py-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 1 }}
        className="pointer-events-none absolute inset-0"
      >
        <Image src={Dotted} alt="dotted" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_10%,_var(--background)_75%)]" />
      </motion.div>
      <div className="relative mx-auto flex w-full max-w-screen-lg flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="z-[1] mb-5 inline-flex items-center rounded-full border border-transparent bg-secondary px-4 py-1.5 font-medium text-secondary-foreground text-sm shadow-sm transition-none"
        >
          <span className="mr-1 text-primary">✦</span>&nbsp;Pricing
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="z-[1] mb-5 w-full text-center font-medium text-[36px] leading-[46px] tracking-tight md:text-[60px] md:leading-[70px]"
        >
          Docs for a&nbsp;
          <span className="bg-primary text-secondary">
            fiver,
            <br />
          </span>
          &nbsp;seriously?&nbsp;
        </motion.p>
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="z-[1] mb-10 w-[90%] max-w-prose text-pretty text-center text-xs md:w-2/3 md:text-base"
        >
          Yes, seriously. A crisp fiver (virtually), and an instant README.
        </motion.span>
        <motion.div
          id="dollar"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
          className="z-[1] aspect-video w-full overflow-hidden rounded-3xl bg-primary p-5 shadow-[15px_15px_0_#D3D3D3] transition-shadow duration-200 hover:shadow-[25px_25px_0_#D3D3D3] md:rounded-4xl md:p-14 dark:shadow-[15px_15px_0_#212A43] dark:hover:shadow-[25px_25px_0_#212A43]"
        >
          <div className="relative flex h-full w-full items-center justify-around bg-[#212A43]">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary md:size-25">
              <span className="font-bold text-base text-secondary md:text-7xl">5</span>
            </div>
            <div className="flex size-20 items-center justify-center rounded-full bg-primary p-2 md:size-60 md:p-5">
              <DollarSign className="size-full text-secondary" />
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-primary md:size-25">
              <span className="font-bold text-base text-secondary md:text-7xl">5</span>
            </div>
            <div className="absolute -top-10 -left-10 size-20 rounded-full bg-primary lg:-top-30 lg:-left-30 lg:size-60" />
            <div className="absolute -top-10 -right-10 size-20 rounded-full bg-primary lg:-top-30 lg:-right-30 lg:size-60" />
            <div className="absolute -bottom-10 -left-10 size-20 rounded-full bg-primary lg:-bottom-30 lg:-left-30 lg:size-60" />
            <div className="absolute -right-10 -bottom-10 size-20 rounded-full bg-primary lg:-right-30 lg:-bottom-30 lg:size-60" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
