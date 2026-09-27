"use client";

import React, { useRef, useState, useMemo } from "react";
import {
  useTimetable,
  COLOR_PALETTE,
} from "@/context/TimetableContext";
import {
  timeToMinutes,
  minutesToTime,
  padTimeHHMM,
  ClassSession,
} from "@/lib/parser";
import {
  Download,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  Calendar,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import html2canvas from "html2canvas-pro";

function formatShortComponent(componentType: string): string {
  if (!componentType) return "Class";
  const lower = componentType.toLowerCase();
  if (lower.includes("lecture")) return "Lecture";
  if (lower.includes("tutorial")) return "Tutorial";
  if (lower.includes("computer lab") || lower.includes("comp lab")) return "Lab";
  if (lower.includes("lab")) return "Lab";
  if (lower.includes("workshop")) return "Workshop";
  if (lower.includes("seminar")) return "Seminar";
  return componentType.replace(/\s*\(.*\)/g, "").trim();
}

const START_MINUTES = 8 * 60;       // 08:00 (covers 08:00 Friday sessions)
const END_MINUTES = 22 * 60 + 30;   // 22:30 (covers latest classes in dataset)
const TOTAL_MINUTES = END_MINUTES - START_MINUTES; // 870 minutes

// 1 minute = 1.15 pixels
const PIXELS_PER_MINUTE = 1.15;
const TOP_OFFSET = 28; // Generous top offset so 08:00 time label and the first session card border are fully visible and never clipped
const GRID_HEIGHT = TOP_OFFSET + TOTAL_MINUTES * PIXELS_PER_MINUTE + 24;

const BASE_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetableGrid() {
  const {
    selectedSubjects,
    activeSessions,
    subjectColors,
    conflicts,
    conflictingSessionIds,
    weekFilter,
    setWeekFilter,
  } = useTimetable();

  const [isExporting, setIsExporting] = useState(false);
  const timetableRef = useRef<HTMLDivElement>(null);

  // Check if any weekend classes exist
  const hasWeekend = useMemo(() => {
    return activeSessions.some(
      (s) => s.day === "Saturday" || s.day === "Sunday"
    );
  }, [activeSessions]);

  const days = useMemo(() => {
    return hasWeekend
      ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      : BASE_DAYS;
  }, [hasWeekend]);

  // Filter active sessions by current week filter
  const displayedSessions = useMemo(() => {
    return activeSessions.filter((s) => {
      if (weekFilter === "all") return true;
      if (s.weekType === "all") return true;
      return s.weekType === weekFilter;
    });
  }, [activeSessions, weekFilter]);

  // Generate time markers for the vertical axis and grid lines (every 30 mins)
  const timeLabels = useMemo(() => {
    const labels: { label: string; top: number; isHalfHour: boolean }[] = [];
    for (let m = START_MINUTES; m <= END_MINUTES; m += 30) {
      const isHalfHour = (m - START_MINUTES) % 60 !== 0;
      labels.push({
        label: minutesToTime(m),
        top: TOP_OFFSET + (m - START_MINUTES) * PIXELS_PER_MINUTE,
        isHalfHour,
      });
    }
    return labels;
  }, []);

  // Compute layout & side-by-side positioning for overlapping sessions per day
  const layoutSessionsByDay = useMemo(() => {
    const map = new Map<
      string,
      Array<{
        session: ClassSession;
        top: number;
        height: number;
        colIndex: number;
        totalCols: number;
      }>
    >();

    for (const day of days) {
      const daySessions = displayedSessions
        .filter((s) => s.day === day)
        .map((s) => {
          const start = Math.max(START_MINUTES, timeToMinutes(s.startTime));
          const end = Math.min(END_MINUTES, timeToMinutes(s.endTime));
          const duration = Math.max(30, end - start);
          return {
            session: s,
            start,
            end,
            top: TOP_OFFSET + (start - START_MINUTES) * PIXELS_PER_MINUTE,
            height: duration * PIXELS_PER_MINUTE,
          };
        });

      // Sort by start time
      daySessions.sort((a, b) => a.start - b.start || b.end - a.end);

      // Compute overlaps & column placement
      const clusters: Array<typeof daySessions> = [];
      let currentCluster: typeof daySessions = [];
      let clusterEnd = 0;

      for (const item of daySessions) {
        if (currentCluster.length === 0) {
          currentCluster.push(item);
          clusterEnd = item.end;
        } else if (item.start < clusterEnd) {
          currentCluster.push(item);
          clusterEnd = Math.max(clusterEnd, item.end);
        } else {
          clusters.push(currentCluster);
          currentCluster = [item];
          clusterEnd = item.end;
        }
      }
      if (currentCluster.length > 0) {
        clusters.push(currentCluster);
      }

      // Assign column indices within each cluster
      const result: Array<{
        session: ClassSession;
        top: number;
        height: number;
        colIndex: number;
        totalCols: number;
      }> = [];

      for (const cluster of clusters) {
        const totalCols = cluster.length;
        cluster.forEach((item, idx) => {
          result.push({
            session: item.session,
            top: item.top,
            height: item.height,
            colIndex: idx,
            totalCols: totalCols,
          });
        });
      }

      map.set(day, result);
    }

    return map;
  }, [days, displayedSessions]);

  // Export Timetable as high-resolution PNG with custom footer and unconstrained width
  const handleExport = async () => {
    if (!timetableRef.current) return;
    setIsExporting(true);

    try {
      // Create a temporary off-screen container with generous desktop width
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.background = "#000000";
      tempContainer.style.width = "1400px";
      tempContainer.style.padding = "20px";
      document.body.appendChild(tempContainer);

      // Clone the timetable element
      const gridClone = timetableRef.current.cloneNode(true) as HTMLElement;
      gridClone.style.width = "100%";
      gridClone.style.minWidth = "1360px";
      gridClone.style.maxWidth = "none";
      gridClone.style.overflow = "visible";
      gridClone.style.boxShadow = "none";

      // Prevent ellipsis clipping by allowing elements to render fully on wide canvas
      const textElements = gridClone.querySelectorAll(".truncate");
      textElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.overflow = "visible";
        htmlEl.style.textOverflow = "clip";
      });

      const scrollContainers = gridClone.querySelectorAll(".overflow-x-auto, .overflow-hidden");
      scrollContainers.forEach((el) => {
        (el as HTMLElement).style.overflow = "visible";
      });

      tempContainer.appendChild(gridClone);

      // Custom footer
      const footer = document.createElement("div");
      footer.style.width = "100%";
      footer.style.padding = "16px 24px";
      footer.style.background = "#000000";
      footer.style.borderTop = "2px solid rgba(255, 255, 255, 0.15)";
      footer.style.display = "flex";
      footer.style.justifyContent = "space-between";
      footer.style.alignItems = "center";
      footer.style.fontFamily = "var(--font-montserrat), Montserrat, sans-serif";
      footer.style.color = "#ffffff";
      footer.style.marginTop = "16px";

      const leftText = document.createElement("span");
      leftText.textContent = "vizla - UOWD Timetable Planner";
      leftText.style.fontWeight = "500";
      leftText.style.fontSize = "14px";

      const rightText = document.createElement("span");
      rightText.textContent = "Built with 🖤 by TP";
      rightText.style.fontWeight = "500";
      rightText.style.fontSize = "12px";

      footer.appendChild(leftText);
      footer.appendChild(rightText);
      tempContainer.appendChild(footer);

      const canvas = await html2canvas(tempContainer, {
        backgroundColor: "#000000",
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
      });

      // Clean up temporary DOM element
      document.body.removeChild(tempContainer);

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const datetime = `${year}${month}${day}-${hours}${minutes}${seconds}`;

      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `vizla-timetable-${datetime}.png`;
      a.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ── Top Action Toolbar ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
        {/* Week View Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setWeekFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              weekFilter === "all"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-white/60 hover:text-white"
            }`}
          >
            All Weeks
          </button>
          <button
            type="button"
            onClick={() => setWeekFilter("odd")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              weekFilter === "odd"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-white/60 hover:text-white"
            }`}
          >
            Odd Weeks
          </button>
          <button
            type="button"
            onClick={() => setWeekFilter("even")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              weekFilter === "even"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-white/60 hover:text-white"
            }`}
          >
            Even Weeks
          </button>
        </div>

        {/* Stats & Export */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 text-xs text-white/50 px-2">
            <span>
              {displayedSessions.length} session
              {displayedSessions.length === 1 ? "" : "s"} scheduled
            </span>
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || displayedSessions.length === 0}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-900/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? "Exporting..." : "Export Image"}</span>
          </button>
        </div>
      </div>

      {/* ── Conflict Alert Banner ────────────────────────────────────── */}
      {conflicts.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl border border-red-500/40 bg-red-950/30 backdrop-blur-md flex items-start gap-3 text-red-200 shadow-lg shadow-red-950/20">
          <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-sm text-red-300">
              {conflicts.length} Schedule Conflict
              {conflicts.length === 1 ? "" : "s"} Detected
            </span>
            <div className="text-xs text-red-200/80 flex flex-col gap-1 mt-0.5">
              {conflicts.map((c, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-1.5">
                  <span className="font-medium text-white">
                    {c.sessionA.subjectCode} ({c.sessionA.componentType})
                  </span>
                  <span>overlaps with</span>
                  <span className="font-medium text-white">
                    {c.sessionB.subjectCode} ({c.sessionB.componentType})
                  </span>
                  <span className="text-red-300/80">
                    on {c.sessionA.day} ({padTimeHHMM(c.sessionA.startTime)} - {padTimeHHMM(c.sessionA.endTime)} vs {padTimeHHMM(c.sessionB.startTime)} - {padTimeHHMM(c.sessionB.endTime)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Timetable Weekly Grid (Exportable Element) ────────────────── */}
      <div
        ref={timetableRef}
        className="rounded-2xl border border-white/15 bg-black/60 backdrop-blur-xl p-3 sm:p-5 overflow-x-auto shadow-2xl"
      >
        <div className="min-w-[720px] flex flex-col">
          {/* Day Headers */}
          <div className="grid grid-cols-[60px_repeat(auto-fit,minmax(0,1fr))] border-b border-white/15 pb-3 mb-2">
            <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider text-center">
              Time
            </div>
            {days.map((day) => (
              <div
                key={day}
                className="text-xs font-bold text-center tracking-wide text-white uppercase"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid Canvas */}
          <div
            className="relative grid grid-cols-[60px_repeat(auto-fit,minmax(0,1fr))] overflow-hidden"
            style={{ height: `${GRID_HEIGHT}px` }}
          >
            {/* Time Axis Column */}
            <div className="relative border-r border-white/15 h-full">
              {timeLabels.map((t) => (
                <div
                  key={t.label}
                  className={`absolute left-0 right-2 -translate-y-1/2 text-right text-[10px] select-none ${
                    t.isHalfHour ? "text-white/35 font-medium" : "text-white/65 font-semibold"
                  }`}
                  style={{ top: `${t.top}px` }}
                >
                  {t.label}
                </div>
              ))}
            </div>

            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 left-[60px] pointer-events-none">
              {timeLabels.map((t) => (
                <div
                  key={`line-${t.label}-${t.top}`}
                  className={`absolute left-0 right-0 ${
                    t.isHalfHour
                      ? "border-b border-dashed border-white/[0.08]"
                      : "border-b border-white/15"
                  }`}
                  style={{ top: `${t.top}px` }}
                />
              ))}
            </div>

            {/* Day Columns */}
            {days.map((day) => {
              const dayLayout = layoutSessionsByDay.get(day) || [];

              return (
                <div
                  key={`col-${day}`}
                  className="relative border-r last:border-r-0 border-white/15 h-full p-1"
                >
                  {dayLayout.map(
                    ({ session, top, height, colIndex, totalCols }) => {
                      const norm = session.subjectCode
                        .replace(/\s+/g, "")
                        .toUpperCase();
                      const color =
                        subjectColors[norm] || COLOR_PALETTE[0];
                      const isConflicted = conflictingSessionIds.has(session.id);

                      // Width and horizontal offset for side-by-side overlap positioning
                      const widthPercent = 100 / totalCols;
                      const leftPercent = colIndex * widthPercent;

                      return (
                        <div
                          key={session.id}
                          className={`absolute rounded-xl border p-1.5 sm:p-2 flex flex-col overflow-hidden shadow-md select-none transition-all ${
                            isConflicted
                              ? "bg-red-950/85 border-red-500 text-red-100 ring-2 ring-red-500/50"
                              : `${color.bg} ${color.border} ${color.text}`
                          }`}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            left: `${leftPercent}%`,
                            width: `calc(${widthPercent}% - 4px)`,
                            marginLeft: "2px",
                            zIndex: isConflicted ? 20 : 10,
                          }}
                        >
                          {/* Row 1: Subject Code + Class Type (on same line if width permits) + Badges */}
                          <div className="flex items-center justify-between gap-1 leading-none shrink-0 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0 truncate">
                              <span className="font-bold text-xs tracking-tight shrink-0">
                                {session.subjectCode}
                              </span>
                              {totalCols <= 2 && (
                                <span className="text-[10px] font-semibold opacity-90 truncate">
                                  {formatShortComponent(session.componentType)}
                                </span>
                              )}
                            </div>
                            {isConflicted ? (
                              <span className="text-[9px] font-bold text-red-200 bg-red-900/80 px-1 py-0.5 rounded border border-red-500/60 shrink-0">
                                Conflict
                              </span>
                            ) : (
                              <div className="flex items-center gap-1 shrink-0">
                                {session.groupCodes.length > 0 && (
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-white/15 font-semibold truncate">
                                    {session.groupCodes.join(",")}
                                  </span>
                                )}
                                {session.weekType !== "all" && (
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-200 font-semibold truncate">
                                    {session.weekType === "odd"
                                      ? "Odd"
                                      : session.weekType === "even"
                                      ? "Even"
                                      : "Dates"}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Row 2: Short Component (shown on separate row only if width is constrained across 3+ parallel slots) */}
                          {totalCols > 2 && height >= 32 && (
                            <div className="text-[11px] font-semibold opacity-95 truncate leading-tight mt-0.5 shrink-0">
                              {formatShortComponent(session.componentType)}
                            </div>
                          )}

                          {/* Row 3: Strict HH:mm Time (shown if height >= 52px) */}
                          {height >= 52 && (
                            <div className="text-[10px] opacity-80 flex items-center gap-1 leading-tight mt-0.5 shrink-0">
                              <Clock className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">
                                {padTimeHHMM(session.startTime)} - {padTimeHHMM(session.endTime)}
                              </span>
                            </div>
                          )}

                          {/* Row 4: Location directly below the time, vertically centered with icon (shown if height >= 74px) */}
                          {height >= 74 && session.location && session.location !== "TBA" && (
                            <div className="text-[10px] opacity-75 flex items-center gap-1 leading-tight mt-0.5 break-words">
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              <span className="break-words line-clamp-2 leading-tight">
                                {session.location}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
