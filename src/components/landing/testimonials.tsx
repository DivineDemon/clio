"use client";

import { Quote } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Dotted from "@/assets/img/dotted.svg";
import { TESTIMONIALS } from "@/lib/constants";

const Testimonials = () => {
  const [itemsToShow, setItemsToShow] = useState(4);

  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth < 768) {
        setItemsToShow(2);
      } else if (window.innerWidth < 1024) {
        setItemsToShow(3);
      } else {
        setItemsToShow(4);
      }
    };

    updateItemsToShow();
    window.addEventListener("resize", updateItemsToShow);

    return () => window.removeEventListener("resize", updateItemsToShow);
  }, []);

  return (
    <div className="relative flex h-screen w-full flex-col items-end justify-end gap-2.5">
      <div className="absolute inset-0 overflow-hidden">
        <Image src={Dotted} alt="dotted" className="h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_10%,_var(--background)_75%)]" />
      </div>
      <div className="z-[2] mx-auto flex w-full max-w-screen-lg flex-col items-start justify-start gap-5 p-5">
        {TESTIMONIALS.slice(0, itemsToShow).map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`w-2/3 ${index % 2 === 0 ? "ml-auto" : "mr-auto"}`}
          >
            <div className="group relative overflow-hidden rounded-xl bg-secondary p-5 text-primary">
              <Quote className="absolute top-4 right-4 text-6xl text-primary/50" />
              <p className="mb-5 pr-5 text-[12px] leading-relaxed md:pr-6 lg:text-base">{testimonial.content}</p>
              <div className="flex items-center gap-4">
                <div className="relative size-10 overflow-hidden rounded-full ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/50 md:size-12">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm md:text-base">{testimonial.name}</p>
                  <p className="text-primary/80 text-xs md:text-sm">{testimonial.username}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
