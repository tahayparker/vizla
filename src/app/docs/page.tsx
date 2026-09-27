"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarRange,
  Info,
  Target,
  BookOpen,
  ListChecks,
  Layers,
  Calendar,
  Cpu,
  Mail,
  ArrowLeft,
} from "lucide-react";

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

const listItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function DocsPage() {
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    scrollToTop();
    const timeout = setTimeout(scrollToTop, 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 pt-20 md:pt-24 flex-grow flex flex-col text-white">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/create"
          className="inline-flex items-center gap-2 text-sm text-purple-500 hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Timetable Planner</span>
        </Link>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainerVariants}
      >
        <div className="space-y-10 text-justify">
          {/* Header Section */}
          <motion.div variants={listItemVariants} className="text-center mb-12">
            <CalendarRange className="mx-auto h-12 w-12 text-purple-500 mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white/95">
              vizla Documentation
            </h1>
            <p className="text-lg text-white/70 mt-2">
              Everything you need to know about timetable planning and conflict resolution at UOWD.
            </p>
          </motion.div>

          {/* What is vizla? */}
          <motion.section variants={listItemVariants} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/20 pb-2 mb-3">
              <Info className="h-6 w-6 text-purple-500 flex-shrink-0" />
              <h2 className="text-2xl font-semibold text-white/90">
                What is vizla?
              </h2>
            </div>
            <p className="text-white/80 text-lg text-justify">
              vizla is a modern, interactive course timetable visualizer and constraint solver designed
              specifically for University of Wollongong in Dubai (UOWD) students. It simplifies course
              enrollment by automatically resolving complex class group dependencies, detecting schedule
              collisions, and visualizing your weekly timetable with precision.
            </p>
            <p className="text-white/80 text-lg text-justify">
              Built for performance and clarity, vizla gives you full control over your semester plan with
              instant conflict warnings, alternate week filtering, and high-resolution export capabilities.
            </p>
          </motion.section>

          {/* Our Goal */}
          <motion.section variants={listItemVariants} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/20 pb-2 mb-3">
              <Target className="h-6 w-6 text-purple-500 flex-shrink-0" />
              <h2 className="text-2xl font-semibold text-white/90">Our Goal</h2>
            </div>
            <p className="text-white/80 text-lg text-justify">
              The primary goal of vizla is to eliminate the headache of course registration. Instead of manually
              cross-referencing PDF timetables, comparing overlapping timeslots, and deciphering group restrictions,
              vizla validates every choice in real time so you can design your ideal weekly schedule in seconds.
            </p>
          </motion.section>

          {/* How to Use */}
          <motion.section variants={listItemVariants} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/20 pb-2 mb-3">
              <BookOpen className="h-6 w-6 text-purple-500 flex-shrink-0" />
              <h2 className="text-2xl font-semibold text-white/90">How to Use</h2>
            </div>
            <p className="text-white/80 text-lg text-justify">
              Planning your timetable with vizla is straightforward:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 pl-1 text-lg">
              <li>
                <strong>Search & Add Courses:</strong> Use the search bar or faculty filter to find your enrolled courses
                by code (e.g., MATH141, CSIT111, BUS 030) or subject title.
              </li>
              <li>
                <strong>Select Components:</strong> Each subject has required components (such as Lecture, Tutorial, Lab, or Workshop).
                Pick one option for each component.
              </li>
              <li>
                <strong>Resolve Group Constraints:</strong> Subjects with linked groups automatically constrain your choices.
                Selecting Group A for your lecture will seamlessly activate only Group A tutorials and labs.
              </li>
              <li>
                <strong>Switch Week Views:</strong> Toggle between All Weeks, Odd Weeks, and Even Weeks on the timetable toolbar
                to see how your schedule shifts across alternating weeks.
              </li>
              <li>
                <strong>Detect & Resolve Conflicts:</strong> If two selected sessions share the same timeslot on the same day and week cycle,
                an alert banner highlights the collision so you can select an alternate timeslot.
              </li>
              <li>
                <strong>Export Your Schedule:</strong> Click "Export Image" to download a crisp, high-resolution PNG image of your timetable,
                complete with custom branding and formatted times.
              </li>
            </ul>
          </motion.section>

          {/* Group & Class Constraints */}
          <motion.section variants={listItemVariants} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/20 pb-2 mb-3">
              <Layers className="h-6 w-6 text-purple-500 flex-shrink-0" />
              <h2 className="text-2xl font-semibold text-white/90">Group & Class Constraints</h2>
            </div>
            <p className="text-white/80 text-lg text-justify">
              Many subjects at UOWD require that related sessions be taken within designated groups. For instance, in BUS 030,
              Lecture 1 corresponds strictly to Tutorial Groups A, B, and C, while Lecture 2 corresponds to Groups D, E, and F.
            </p>
            <p className="text-white/80 text-lg text-justify">
              vizla parses these rule expressions into constraint sets. When you choose a component option, incompatible
              alternatives in sibling components are clearly flagged or automatically updated, ensuring that your final
              timetable is 100% compliant with university enrolment policies.
            </p>
          </motion.section>

          {/* Odd & Even Weeks */}
          <motion.section variants={listItemVariants} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/20 pb-2 mb-3">
              <Calendar className="h-6 w-6 text-purple-500 flex-shrink-0" />
              <h2 className="text-2xl font-semibold text-white/90">Odd & Even Weeks</h2>
            </div>
            <p className="text-white/80 text-lg text-justify">
              Certain laboratory and tutorial sessions meet every second week based on the official UOWD Academic Calendar.
              Weeks 1, 3, 5, 7, 9, 11, and 13 are Odd Weeks, while Weeks 2, 4, 6, 8, 10, 12, and 14 are Even Weeks.
            </p>
            <p className="text-white/80 text-lg text-justify">
              Two classes held at the exact same hour on the same day do not produce a schedule conflict if one is designated
              for Odd Weeks and the other for Even Weeks. vizla accounts for week periodicity in real time.
            </p>
          </motion.section>

          {/* Features */}
          <motion.section variants={listItemVariants} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/20 pb-2 mb-3">
              <ListChecks className="h-6 w-6 text-purple-500 flex-shrink-0" />
              <h2 className="text-2xl font-semibold text-white/90">Features</h2>
            </div>
            <ul className="list-disc list-inside space-y-2 text-white/80 pl-1 text-lg">
              <motion.li variants={listItemVariants}>
                <strong>Full University Course Catalog:</strong> Instant access to all courses, lectures, tutorials, and computer labs.
              </motion.li>
              <motion.li variants={listItemVariants}>
                <strong>Automatic Conflict Detection:</strong> Live detection of overlapping classes respecting week cycles.
              </motion.li>
              <motion.li variants={listItemVariants}>
                <strong>Distinct Color Themes:</strong> 6 vibrant, distinguishable color identities to easily identify subjects on the calendar.
              </motion.li>
              <motion.li variants={listItemVariants}>
                <strong>Automatic Local Storage Sync:</strong> Your selected courses and chosen timeslots are saved automatically and restored on reload.
              </motion.li>
              <motion.li variants={listItemVariants}>
                <strong>High-Res Image Export:</strong> One-click export of your weekly timetable with branding and timestamps.
              </motion.li>
              <motion.li variants={listItemVariants}>
                <strong>Responsive Layout:</strong> Optimized for all devices from mobile smartphones to ultra-wide desktop monitors.
              </motion.li>
            </ul>
          </motion.section>

          {/* Tech Stack */}
          <motion.section variants={listItemVariants} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/20 pb-2 mb-3">
              <Cpu className="h-6 w-6 text-purple-500 flex-shrink-0" />
              <h2 className="text-2xl font-semibold text-white/90">
                Tech Stack
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-white/80 text-lg">
              <div>
                <h3 className="font-semibold text-purple-500 mb-2">Frontend</h3>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Next.js 16 (App Router)</li>
                  <li>TypeScript</li>
                  <li>Tailwind CSS 4</li>
                  <li>Framer Motion</li>
                  <li>Lucide Icons</li>
                  <li>html2canvas-pro</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-purple-500 mb-2">Visuals & Performance</h3>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>WebGL Plasma Shader (OGL)</li>
                  <li>Local Storage Persistence</li>
                  <li>Zero-Overhead Static Generation</li>
                  <li>Client-Side Constraint Solver</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section variants={listItemVariants} className="space-y-0">
            <div className="flex items-center gap-3 border-b border-white/20 pb-2 mb-3">
              <Mail className="h-6 w-6 text-purple-500 flex-shrink-0" />
              <h2 className="text-2xl font-semibold text-white/90">
                Contact & Links
              </h2>
            </div>
            <div className="space-y-2 text-white/80 text-lg">
              <p>
                <strong>Created by:</strong> Taha Parker
              </p>
              <p>
                <strong>Contact:</strong>{" "}
                <Link
                  href="https://tahayparker.vercel.app/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-500 hover:underline"
                >
                  Personal Website
                </Link>
              </p>
            </div>
          </motion.section>

          {/* Footer Note */}
          <motion.div
            variants={listItemVariants}
            className="text-center text-white/60 text-sm pt-6 border-t border-white/10"
          >
            <p>For students, by students. Built with 🖤 by TP.</p>
            <p className="mt-2">
              Proudly open source and continuously improving.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
