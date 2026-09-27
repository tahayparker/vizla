"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarRange } from "lucide-react";
import Link from "next/link";

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex flex-col items-center justify-center relative text-center max-w-6xl mx-auto py-10 px-4">
      {/* Content */}
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={slideUpVariants}
          className="text-5xl sm:text-6xl md:text-7xl font-bold mb-5 tracking-tight leading-tight text-white"
        >
          timetable, <br className="sm:hidden" /> visualized.
        </motion.h1>
        <motion.p
          variants={slideUpVariants}
          className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
        >
          Stop wrestling with overlapping classes and PDF schedules. vizla
          makes planning your UOWD timetable effortless.
        </motion.p>
        <motion.div
          variants={slideUpVariants}
          className="flex gap-4 items-center justify-center flex-col sm:flex-row"
        >
          <Link
            className="group relative inline-flex items-center justify-center rounded-full border border-solid border-transparent transition-colors bg-purple-500 text-white gap-2 shadow-lg hover:bg-purple-500 hover:shadow-purple-500/30 font-medium text-sm sm:text-base h-11 sm:h-12 px-6 sm:px-8 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-background"
            href="/create"
          >
            <CalendarRange className="h-5 w-5 transition-transform duration-200 group-hover:translate-y-[-2px]" />
            Plan Timetable
          </Link>
          <Link
            className="rounded-full border border-solid border-white/[.3] transition-colors flex items-center justify-center hover:bg-white/[.1] hover:border-white/[.5] font-medium text-sm sm:text-base h-11 sm:h-12 px-6 sm:px-8 w-full sm:w-auto text-white"
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn More
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
