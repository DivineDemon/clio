"use client";

import { motion } from "motion/react";
import { FEATURES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const Features = () => {
  return (
    <div className="mx-auto flex w-full max-w-screen-lg flex-col items-center justify-center px-5 py-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-5 inline-flex items-center rounded-full border border-transparent bg-secondary px-4 py-1.5 font-medium text-secondary-foreground text-sm shadow-sm transition-none"
      >
        <span className="mr-1 text-primary">✦</span>&nbsp;Features
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mb-10 w-full text-center font-medium text-[36px] leading-[46px] tracking-tight md:text-[60px] md:leading-[70px]"
      >
        <span className="bg-primary text-secondary">Everything</span> you need,&nbsp;
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">automatically</span>
      </motion.p>
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-[90%] max-w-prose text-pretty text-center text-xs md:w-2/3 md:text-base"
      >
        From intelligent code analysis to seamless GitHub integration — Clio handles every step of README creation so
        you can focus on what matters most: building great software.
      </motion.span>
      <div className="mt-10 grid w-full grid-cols-1 items-center justify-center gap-5 md:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={cn(
              "flex h-full w-full flex-col items-start justify-start rounded-xl bg-secondary p-5 dark:bg-primary/50",
              {
                "col-span-1 lg:col-span-2": feature.id === 1 || feature.id === 6,
              },
            )}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 + 0.2, type: "spring" }}
              className="size-12 rounded-full bg-primary p-3 dark:bg-secondary"
            >
              <feature.icon className="size-full text-secondary dark:text-primary" />
            </motion.div>
            <h3 className="mt-5 mb-2.5 font-bold text-[20px] leading-[25px] tracking-tight">{feature.title}</h3>
            <p className="text-[14px] text-black/65 leading-[19px] tracking-tight dark:text-gray-400">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Features;
