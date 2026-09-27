"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  useTimetable,
  COLOR_PALETTE,
  SubjectColor,
} from "@/context/TimetableContext";
import {
  Search,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Palette,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  Users,
  Calendar,
  Layers,
  CheckCircle2,
  X,
  Filter,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { padTimeHHMM } from "@/lib/parser";

export default function SubjectSelector() {
  const {
    allSubjects,
    selectedSubjects,
    selectedOptions,
    subjectColors,
    addSubject,
    removeSubject,
    toggleOption,
    setSubjectColor,
    isOptionSelected,
    isOptionDisabledDueToGroup,
  } = useTimetable();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("All");
  const [isFacultyOpen, setIsFacultyOpen] = useState(false);
  const facultyRef = useRef<HTMLDivElement>(null);

  const [activeColorPickerSubject, setActiveColorPickerSubject] = useState<
    string | null
  >(null);
  const [collapsedSubjects, setCollapsedSubjects] = useState<
    Record<string, boolean>
  >({});

  // Close faculty dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        facultyRef.current &&
        !facultyRef.current.contains(event.target as Node)
      ) {
        setIsFacultyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Faculty options list
  const faculties = useMemo(() => {
    const list = Array.from(new Set(allSubjects.map((s) => s.faculty))).filter(
      Boolean
    );
    list.sort();
    return ["All", ...list];
  }, [allSubjects]);

  // Subject counts per faculty
  const facultyCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allSubjects.length };
    for (const s of allSubjects) {
      if (s.faculty) {
        counts[s.faculty] = (counts[s.faculty] || 0) + 1;
      }
    }
    return counts;
  }, [allSubjects]);

  // Filtered available subjects for the search picker (displays ALL matches without truncation)
  const filteredAvailableSubjects = useMemo(() => {
    const selectedSet = new Set(selectedSubjects.map((s) => s.normalizedCode));
    const q = searchQuery.trim().toLowerCase();

    return allSubjects
      .filter((s) => !selectedSet.has(s.normalizedCode))
      .filter((s) => {
        if (selectedFaculty !== "All" && s.faculty !== selectedFaculty) {
          return false;
        }
        if (!q) return true;
        return (
          s.code.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.normalizedCode.toLowerCase().includes(q)
        );
      });
  }, [allSubjects, selectedSubjects, searchQuery, selectedFaculty]);

  const toggleCollapse = (code: string) => {
    setCollapsedSubjects((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* ── Search & Add Panel ────────────────────────────────────────── */}
      <div className="relative z-30 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 sm:p-5 flex flex-col gap-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold tracking-wide uppercase text-white/90">
              Find Subjects ({allSubjects.length})
            </h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code or name (e.g. MATH141, BUS 030)..."
              className="w-full h-12 pl-4 pr-10 text-sm bg-black/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/50 transition-all select-text"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Custom Shadcn-style Faculty Dropdown */}
          <div className="relative z-40 shrink-0" ref={facultyRef}>
            <button
              type="button"
              onClick={() => setIsFacultyOpen((prev) => !prev)}
              className="h-12 w-full sm:w-auto px-4 text-xs sm:text-sm font-medium bg-black/50 hover:bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-white flex items-center justify-between gap-3 transition-all cursor-pointer shadow-sm"
              aria-haspopup="listbox"
              aria-expanded={isFacultyOpen}
            >
              <div className="flex items-center gap-2 truncate">
                <Filter className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-[170px]">
                  {selectedFaculty === "All" ? "All Faculties" : selectedFaculty}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-white/10 text-white/60 font-semibold font-mono">
                  {facultyCounts[selectedFaculty] || allSubjects.length}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
                    isFacultyOpen ? "rotate-180 text-white" : ""
                  }`}
                />
              </div>
            </button>

            <AnimatePresence>
              {isFacultyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-y-auto z-50 rounded-xl border border-white/15 bg-neutral-950/95 backdrop-blur-xl p-1.5 shadow-2xl flex flex-col gap-0.5"
                  role="listbox"
                >
                  <div className="px-2 py-1.5 text-[10px] uppercase font-bold tracking-wider text-white/40 border-b border-white/5 mb-1">
                    Select Faculty
                  </div>
                  {faculties.map((f) => {
                    const isSelected = selectedFaculty === f;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          setSelectedFaculty(f);
                          setIsFacultyOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                          isSelected
                            ? "bg-purple-600/25 text-purple-200 border border-purple-500/30"
                            : "text-white/80 hover:text-white hover:bg-white/5"
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <div className="w-4 h-4 flex items-center justify-center shrink-0">
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-purple-400" />
                            )}
                          </div>
                          <span className="truncate">
                            {f === "All" ? "All Faculties" : f}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                            isSelected
                              ? "bg-purple-500/30 text-purple-200"
                              : "bg-white/5 text-white/40"
                          }`}
                        >
                          {facultyCounts[f] || 0}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Search Results Dropdown (Shows ALL matching subjects) */}
        {(searchQuery.trim() !== "" || selectedFaculty !== "All") && (
          <div className="mt-1 flex flex-col gap-2 p-2 rounded-xl bg-black/60 border border-white/10 shadow-inner">
            <div className="flex items-center justify-between px-2 pt-1 text-xs text-white/50">
              <span>
                {filteredAvailableSubjects.length} subject{filteredAvailableSubjects.length === 1 ? "" : "s"} found
                {selectedFaculty !== "All" && ` in ${selectedFaculty}`}
              </span>
              {selectedFaculty !== "All" && (
                <button
                  type="button"
                  onClick={() => setSelectedFaculty("All")}
                  className="text-[11px] text-purple-400 hover:text-purple-300 underline underline-offset-2 cursor-pointer"
                >
                  Reset Faculty
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto flex flex-col gap-1.5 pr-1">
              {filteredAvailableSubjects.length === 0 ? (
                <div className="p-6 text-center text-xs text-white/40">
                  No matching subjects found
                </div>
              ) : (
                filteredAvailableSubjects.map((subject) => (
                  <div
                    key={subject.normalizedCode}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white/[0.02] hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 transition-all group"
                  >
                    <div className="flex flex-col min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-purple-300 group-hover:text-purple-200">
                          {subject.code}
                        </span>
                        <span className="text-xs text-white/80 truncate font-medium max-w-[200px] sm:max-w-sm">
                          {subject.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-white/40 mt-0.5 truncate">
                        {subject.faculty} • {subject.components.length} component{subject.components.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        addSubject(subject.normalizedCode);
                        setSearchQuery("");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-xs text-white shadow-md shadow-purple-600/30 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Selected Subjects Panel ────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold tracking-wide uppercase text-white/90">
              Selected Courses ({selectedSubjects.length})
            </h3>
          </div>
          {selectedSubjects.length > 0 && (
            <span className="text-xs text-white/50">
              Pick 1 option per component
            </span>
          )}
        </div>

        {selectedSubjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center flex flex-col items-center justify-center gap-2 bg-white/[0.01]">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/30">
              <Plus className="w-5 h-5" />
            </div>
            <p className="text-sm text-white/60 font-medium">
              No subjects selected yet
            </p>
            <p className="text-xs text-white/40 max-w-xs">
              Use the search bar above to add subjects like BUS 030, CSIT111, or
              ACCY121 to your planner.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {selectedSubjects.map((subject) => {
              const color = subjectColors[subject.normalizedCode] || COLOR_PALETTE[0];
              const isCollapsed = collapsedSubjects[subject.normalizedCode];

              // Check enrollment completion (all required components fulfilled)
              const completedCount = subject.components.filter(
                (c) => selectedOptions[c.id]
              ).length;
              const isFullySelected =
                completedCount === subject.components.length;

              return (
                <div
                  key={subject.normalizedCode}
                  className={`rounded-2xl border transition-all overflow-hidden bg-white/[0.02] backdrop-blur-md ${
                    isFullySelected
                      ? "border-white/20 shadow-lg shadow-purple-950/20"
                      : "border-white/10"
                  }`}
                >
                  {/* Subject Header */}
                  <div
                    className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-colors"
                    onClick={() => toggleCollapse(subject.normalizedCode)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Color indicator pill */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveColorPickerSubject(
                            activeColorPickerSubject === subject.normalizedCode
                              ? null
                              : subject.normalizedCode
                          );
                        }}
                        className="w-4 h-4 rounded-full border border-white/40 shrink-0 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color.pill }}
                        title="Change subject color"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">
                            {subject.code}
                          </span>
                          <span className="text-xs text-white/80 font-medium truncate max-w-[180px] sm:max-w-xs">
                            {subject.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-white/40 flex items-center gap-2 mt-0.5">
                          <span>{subject.faculty}</span>
                          <span>•</span>
                          <span
                            className={
                              isFullySelected
                                ? "text-green-400 font-medium"
                                : "text-amber-400/90 font-medium"
                            }
                          >
                            {completedCount}/{subject.components.length}{" "}
                            scheduled
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSubject(subject.normalizedCode);
                        }}
                        className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1 text-white/40 hover:text-white"
                        aria-label="Expand or collapse"
                      >
                        {isCollapsed ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Color Picker Popover */}
                  <AnimatePresence>
                    {activeColorPickerSubject === subject.normalizedCode && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 py-2 bg-black/60 border-t border-b border-white/10 flex items-center gap-2 flex-wrap"
                      >
                        <span className="text-[11px] text-white/50 mr-1">
                          Theme:
                        </span>
                        {COLOR_PALETTE.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => {
                              setSubjectColor(subject.normalizedCode, p);
                              setActiveColorPickerSubject(null);
                            }}
                            className={`w-5 h-5 rounded-full border ${
                              color.name === p.name
                                ? "border-white ring-2 ring-purple-500"
                                : "border-white/20 hover:scale-110"
                            } transition-all`}
                            style={{ backgroundColor: p.pill }}
                            title={p.name}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Component groups list */}
                  {!isCollapsed && (
                    <div className="p-3.5 sm:p-4 border-t border-white/5 bg-black/30 flex flex-col gap-4">
                      {subject.components.map((component, compIdx) => {
                        const selectedOptionId = selectedOptions[component.id];

                        return (
                          <div
                            key={component.id}
                            className="flex flex-col gap-2 rounded-xl bg-white/[0.02] border border-white/5 p-3"
                          >
                            {/* Component Title */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                                  {component.name}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50">
                                  Select 1 of {component.options.length}
                                </span>
                              </div>
                              {selectedOptionId && (
                                <span className="flex items-center gap-1 text-[11px] text-green-400">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Selected</span>
                                </span>
                              )}
                            </div>

                            {/* Options Radio List */}
                            <div className="flex flex-col gap-1.5 mt-1">
                              {component.options.map((option) => {
                                const isSelected =
                                  selectedOptionId === option.id;
                                const isGroupDisabled =
                                  isOptionDisabledDueToGroup(subject, option);

                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    disabled={isGroupDisabled}
                                    onClick={() =>
                                      toggleOption(
                                        subject.normalizedCode,
                                        component.id,
                                        option.id
                                      )
                                    }
                                    className={`relative flex flex-col p-2.5 rounded-xl border text-left transition-all ${
                                      isSelected
                                        ? "bg-purple-900/40 border-purple-500/70 shadow-sm"
                                        : isGroupDisabled
                                        ? "bg-black/20 border-white/5 opacity-40 cursor-not-allowed"
                                        : "bg-black/30 border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                                    }`}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      {/* Radio indicator */}
                                      <div
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                          isSelected
                                            ? "border-purple-400 bg-purple-500"
                                            : "border-white/30 bg-transparent"
                                        }`}
                                      >
                                        {isSelected && (
                                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                        )}
                                      </div>

                                      {/* Content: Group first, then day, time, location, lecturer */}
                                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                          {/* Group badge first */}
                                          {option.groupCodes.length > 0 && (
                                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1 shrink-0">
                                              <Users className="w-3 h-3" />
                                              <span>{option.groupCodes.join(", ")}</span>
                                            </span>
                                          )}

                                          {option.sessions.map((sess) => (
                                            <React.Fragment key={sess.id}>
                                              <span className="flex items-center gap-1 text-white font-medium">
                                                <Calendar className="w-3 h-3 text-purple-400" />
                                                {sess.day}
                                              </span>
                                              <span className="flex items-center gap-1 text-white/90">
                                                <Clock className="w-3 h-3 text-purple-400" />
                                                {padTimeHHMM(sess.startTime)} - {padTimeHHMM(sess.endTime)}
                                              </span>
                                              <span className="flex items-center gap-1 text-white/70">
                                                <MapPin className="w-3 h-3 text-white/40" />
                                                {sess.location}
                                              </span>
                                              {sess.lecturer && sess.lecturer !== "TBA" && (
                                                <span className="flex items-center gap-1 text-white/70">
                                                  <User className="w-3 h-3 text-white/40" />
                                                  {sess.lecturer}
                                                </span>
                                              )}
                                              {sess.weekType !== "all" && (
                                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                                                  {sess.scheduleNote || sess.weekType}
                                                </span>
                                              )}
                                            </React.Fragment>
                                          ))}
                                        </div>

                                        {/* Group incompatibility warning message */}
                                        {isGroupDisabled && (
                                          <div className="flex items-center gap-1 text-[10px] text-amber-400/90 mt-0.5">
                                            <AlertTriangle className="w-3 h-3" />
                                            <span>
                                              Incompatible with your other selected group
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
