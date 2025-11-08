"use client";

import { motion } from "motion/react";
import { login } from "@/lib/server-actions/auth";

const CTA = () => {
  return (
    <section className="mt-20 w-full overflow-hidden bg-primary">
      <div className="relative mx-auto flex w-full max-w-screen-lg flex-col items-center justify-center gap-6 px-5 py-20 text-primary-foreground">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="z-[1] inline-flex items-center rounded-full border border-transparent bg-secondary px-4 py-1.5 font-medium text-secondary-foreground text-sm shadow-sm transition-none"
        >
          <span className="mr-1 text-primary">✦</span>&nbsp;Ready to ship?
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="z-[1] w-full text-center font-medium text-[30px] leading-[40px] tracking-tight md:text-[48px] md:leading-[68px]"
        >
          Ship a polished README
          <br />
          today for just&nbsp;<span className="rounded bg-secondary px-2 text-primary">$5.</span>
        </motion.p>
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="z-[1] w-[90%] max-w-prose text-pretty text-center text-primary-foreground/80 text-xs md:w-2/3 md:text-base"
        >
          Kick off a job, review the output, and drop it straight into your repo. No subscriptions, no surprises—just
          docs on demand.
        </motion.span>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          type="button"
          onClick={login}
          className="z-[1] inline-flex items-center justify-center rounded-full bg-secondary px-6 py-3 font-semibold text-primary shadow-lg transition-colors hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-foreground/40"
        >
          Generate my README
        </motion.button>
      </div>
    </section>
  );
};

export default CTA;
