"use client";

import MDEditor from "@uiw/react-md-editor";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import Line from "@/assets/img/line.svg";
import SampleOne from "@/assets/img/sample-one.svg";
import { SAMPLE_TWO } from "@/lib/constants";
import GithubLoginButton from "../auth/github-login-button";
import { Switch } from "../ui/switch";

const Header = () => {
  const [render, setRender] = useState<boolean>(false);

  return (
    <div className="w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(58,91,160,0.8),rgba(255,255,255,0))] bg-background dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,224,102,0.3),rgba(255,255,255,0))]">
      <header className="relative mx-auto flex h-screen w-full max-w-screen-lg flex-col items-start justify-start">
        <div className="mx-auto flex h-[calc(100vh-400px)] w-full max-w-screen-lg flex-col items-center justify-end pb-10 md:pb-5 xl:justify-center xl:pb-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-5 inline-flex items-center rounded-full border border-transparent bg-secondary px-4 py-1.5 font-medium text-secondary-foreground text-sm shadow-sm transition-none"
          >
            <span className="mr-1 text-primary">✦</span>&nbsp;AI README Generator
          </motion.div>
          <div id="title" className="relative mb-10 w-full md:mb-14">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="relative z-[1] w-full text-center font-medium text-[36px] leading-[46px] tracking-tight md:text-[60px] md:leading-[70px]"
            >
              Let <span className="text-secondary text-shadow-primary">Clio</span> tell your
              <br /> project&apos;s
              <span className="text-primary">&nbsp;story</span>
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Image
                src={Line}
                alt="line"
                className="-bottom-4 md:-bottom-10 lg:-bottom-8 absolute left-[20%] z-0 w-1/3 md:left-[22.5%] lg:left-[29%] lg:w-auto"
              />
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex w-full flex-col items-center justify-center gap-5"
          >
            <span className="w-[90%] max-w-prose text-pretty text-center text-xs md:w-2/3 md:text-base">
              Because the best code in the world still needs great documentation — Clio automatically builds READMEs
              that inform, engage, and impress.
            </span>
            <GithubLoginButton size="lg" />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="absolute top-[calc(100vh-400px)] z-[1] h-[800px] w-full overflow-hidden rounded-2xl p-5 backdrop-blur-md xl:bg-primary/50 xl:dark:bg-secondary/10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, duration: 0.4 }}
            className="absolute top-10 right-10 z-[1] flex items-center justify-center gap-2.5"
          >
            <span className="mt-0.5 text-[14px] text-secondary leading-[14px]">View {render ? "Code" : "Render"}</span>
            <Switch checked={render} onCheckedChange={setRender} />
          </motion.div>
          <AnimatePresence mode="wait">
            {render ? (
              <motion.div
                key="markdown"
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                data-color-mode="dark"
              >
                <MDEditor.Markdown
                  source={SAMPLE_TWO}
                  style={{
                    height: "760px",
                    padding: "20px",
                    overflow: "hidden",
                    borderRadius: "16px",
                    backgroundColor: "#011627",
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="image"
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="h-[760px]"
              >
                <Image
                  src={SampleOne}
                  alt="sample-one"
                  width={1000}
                  height={1000}
                  className="h-full w-full rounded-2xl object-cover object-top"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </header>
    </div>
  );
};

export default Header;
