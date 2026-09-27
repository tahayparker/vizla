"use client";

import React, { useState } from "react";
import SubjectSelector from "@/components/SubjectSelector";
import TimetableGrid from "@/components/TimetableGrid";
import { useTimetable } from "@/context/TimetableContext";
import {
  CalendarRange,
  HelpCircle,
  X,
  Layers,
  Calendar,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function CreateTimetablePage() {
  const { selectedSubjects, activeSessions, conflicts, clearAll } = useTimetable();
  const [showHelp, setShowHelp] = useState(false);
  const [mobileTab, setMobileTab] = useState<"courses" | "timetable">("timetable");

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Page Header Banner ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Course Timetable Planner
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-2xl">
            Select courses, resolve tutorial & lecture group constraints, and
            visualize your weekly schedule with automated collision detection.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>How it works</span>
          </button>

          {selectedSubjects.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-300 transition-all cursor-pointer"
            >
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile Tab Switcher (Visible on < lg) ────────────────────── */}
      <div className="flex lg:hidden rounded-xl bg-black/60 p-1 border border-white/10">
        <button
          type="button"
          onClick={() => setMobileTab("timetable")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
            mobileTab === "timetable"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Timetable Grid ({activeSessions.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("courses")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
            mobileTab === "courses"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Courses ({selectedSubjects.length})</span>
        </button>
      </div>

      {/* ── Main Two-Column Layout ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Subjects & Component Selection */}
        <div
          className={`lg:col-span-5 xl:col-span-4 flex flex-col gap-4 ${
            mobileTab === "courses" ? "block" : "hidden lg:block"
          }`}
        >
          <SubjectSelector />
        </div>

        {/* Right Column: Weekly Schedule Grid */}
        <div
          className={`lg:col-span-7 xl:col-span-8 flex flex-col gap-4 ${
            mobileTab === "timetable" ? "block" : "hidden lg:block"
          }`}
        >
          <TimetableGrid />
        </div>
      </div>

      {/* ── Help / Instructions Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-white/15 bg-neutral-950 p-6 flex flex-col gap-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-purple-400">
                  <CalendarRange className="w-5 h-5" />
                  <h3 className="font-bold text-base text-white">
                    How vizla Works
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHelp(false)}
                  className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3 text-xs text-white/70 leading-relaxed">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="font-bold text-purple-400 text-sm">1.</span>
                  <div>
                    <strong className="text-white">Required Components:</strong>
                    <p className="mt-0.5">
                      Each course consists of required components (e.g. Lecture,
                      Tutorial, Lab). You must choose 1 option for each
                      component.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="font-bold text-purple-400 text-sm">2.</span>
                  <div>
                    <strong className="text-white">
                      Group & Class Constraints:
                    </strong>
                    <p className="mt-0.5">
                      Certain courses (like BUS 030) group lectures and
                      tutorials (e.g. Groups A,B,C vs E,F,G). When you select a
                      lecture, only tutorials matching that group remain active.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="font-bold text-purple-400 text-sm">3.</span>
                  <div>
                    <strong className="text-white">Odd & Even Weeks:</strong>
                    <p className="mt-0.5">
                      Classes marked "Odd Weeks" and "Even Weeks" at the same
                      time slot do not conflict, because they meet on
                      alternating weeks.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="font-bold text-purple-400 text-sm">4.</span>
                  <div>
                    <strong className="text-white">Exporting:</strong>
                    <p className="mt-0.5">
                      Click the "Export Image" button to save your finished
                      schedule as a high-res PNG image.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
