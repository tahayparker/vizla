"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import {
  Subject,
  ComponentOption,
  ClassSession,
  parseTimetableData,
  doSessionsConflict,
  isOptionCompatible,
} from "@/lib/parser";
import rawData from "@/data/timetable_raw.json";

export interface SubjectColor {
  name: string;
  bg: string;
  border: string;
  text: string;
  badge: string;
  pill: string;
}

export const COLOR_PALETTE: SubjectColor[] = [
  {
    name: "Purple",
    bg: "bg-purple-950/70",
    border: "border-purple-500/60",
    text: "text-purple-200",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    pill: "#8b5cf6",
  },
  {
    name: "Emerald",
    bg: "bg-emerald-950/70",
    border: "border-emerald-500/60",
    text: "text-emerald-200",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    pill: "#10b981",
  },
  {
    name: "Amber",
    bg: "bg-amber-950/70",
    border: "border-amber-500/60",
    text: "text-amber-200",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    pill: "#f59e0b",
  },
  {
    name: "Blue",
    bg: "bg-sky-950/70",
    border: "border-sky-500/60",
    text: "text-sky-200",
    badge: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    pill: "#0ea5e9",
  },
  {
    name: "Pink",
    bg: "bg-pink-950/70",
    border: "border-pink-500/60",
    text: "text-pink-200",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    pill: "#ec4899",
  },
{
  name: "Gray",
  bg: "bg-neutral-800/80",
  border: "border-neutral-400/60",
  text: "text-neutral-200",
  badge: "bg-neutral-400/20 text-neutral-200 border-neutral-400/30",
  pill: "#a3a3a3",
},
];

const STORAGE_KEY = "vizla_saved_timetable_v1";

interface ConflictPair {
  sessionA: ClassSession;
  sessionB: ClassSession;
}

interface TimetableContextType {
  allSubjects: Subject[];
  selectedSubjects: Subject[];
  selectedOptions: Record<string, string>; // compId -> optionId
  subjectColors: Record<string, SubjectColor>; // normalizedCode -> Color
  weekFilter: "all" | "odd" | "even";
  conflicts: ConflictPair[];
  conflictingSessionIds: Set<string>;
  activeSessions: ClassSession[];

  addSubject: (code: string) => void;
  removeSubject: (code: string) => void;
  toggleOption: (subjectCode: string, compId: string, optionId: string) => void;
  setSubjectColor: (code: string, color: SubjectColor) => void;
  setWeekFilter: (f: "all" | "odd" | "even") => void;
  clearAll: () => void;
  isOptionSelected: (compId: string, optionId: string) => boolean;
  isOptionDisabledDueToGroup: (
    subject: Subject,
    option: ComponentOption
  ) => boolean;
}

const TimetableContext = createContext<TimetableContextType | null>(null);

export function TimetableProvider({ children }: { children: React.ReactNode }) {
  // Parse subjects once from raw JSON
  const allSubjects = useMemo(() => {
    return parseTimetableData(rawData as any);
  }, []);

  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [subjectColors, setSubjectColorsState] = useState<Record<string, SubjectColor>>({});
  const [weekFilter, setWeekFilter] = useState<"all" | "odd" | "even">("all");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved timetable selections from localStorage on client mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.selectedCodes)) {
          setSelectedCodes(parsed.selectedCodes);
        }
        if (parsed.selectedOptions && typeof parsed.selectedOptions === "object") {
          setSelectedOptions(parsed.selectedOptions);
        }
        if (parsed.subjectColors && typeof parsed.subjectColors === "object") {
          const validColorsByName = new Map(
            COLOR_PALETTE.map((c) => [c.name.toLowerCase(), c])
          );
          validColorsByName.set("violet", COLOR_PALETTE[0]); // map legacy Violet -> Purple
          validColorsByName.set("cyan", COLOR_PALETTE[3]); // map legacy Cyan -> Blue
          validColorsByName.set("sky", COLOR_PALETTE[3]); // map legacy Sky -> Blue
          validColorsByName.set("slate", COLOR_PALETTE[5]); // map legacy Slate -> Silver
          validColorsByName.set("zinc", COLOR_PALETTE[5]); // map legacy Zinc -> Silver

          const sanitizedColors: Record<string, SubjectColor> = {};
          let colorIdx = 0;
          for (const [code, col] of Object.entries(parsed.subjectColors)) {
            const rawCol = col as any;
            const matchedByName = rawCol?.name
              ? validColorsByName.get(rawCol.name.toLowerCase())
              : null;
            const matchedByPill = COLOR_PALETTE.find(
              (c) => c.pill.toLowerCase() === rawCol?.pill?.toLowerCase()
            );

            if (matchedByName) {
              sanitizedColors[code] = matchedByName;
            } else if (matchedByPill) {
              sanitizedColors[code] = matchedByPill;
            } else {
              // Legacy/unrecognized color (e.g. old Fuchsia or Orange) -> replace with valid palette
              sanitizedColors[code] =
                COLOR_PALETTE[colorIdx % COLOR_PALETTE.length];
            }
            colorIdx++;
          }
          setSubjectColorsState(sanitizedColors);
        }
        if (parsed.weekFilter && ["all", "odd", "even"].includes(parsed.weekFilter)) {
          setWeekFilter(parsed.weekFilter);
        }
      }
    } catch (err) {
      console.warn("Failed to load timetable from localStorage:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save timetable selections to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dataToSave = {
        selectedCodes,
        selectedOptions,
        subjectColors,
        weekFilter,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (err) {
      console.warn("Failed to save timetable to localStorage:", err);
    }
  }, [selectedCodes, selectedOptions, subjectColors, weekFilter, isLoaded]);

  // Load / sync selected subjects
  const selectedSubjects = useMemo(() => {
    return selectedCodes
      .map((code) => allSubjects.find((s) => s.normalizedCode === code))
      .filter((s): s is Subject => Boolean(s));
  }, [selectedCodes, allSubjects]);

  // Collect all currently chosen sessions across all subjects
  const activeSessions = useMemo(() => {
    const list: ClassSession[] = [];

    for (const subject of selectedSubjects) {
      for (const comp of subject.components) {
        const chosenOptionId = selectedOptions[comp.id];
        if (!chosenOptionId) continue;

        const option = comp.options.find((o) => o.id === chosenOptionId);
        if (option) {
          list.push(...option.sessions);
        }
      }
    }

    return list;
  }, [selectedSubjects, selectedOptions]);

  // Real-time conflict detection respecting week types
  const { conflicts, conflictingSessionIds } = useMemo(() => {
    const conflictList: ConflictPair[] = [];
    const idSet = new Set<string>();

    for (let i = 0; i < activeSessions.length; i++) {
      for (let j = i + 1; j < activeSessions.length; j++) {
        const a = activeSessions[i];
        const b = activeSessions[j];

        if (doSessionsConflict(a, b)) {
          conflictList.push({ sessionA: a, sessionB: b });
          idSet.add(a.id);
          idSet.add(b.id);
        }
      }
    }

    return { conflicts: conflictList, conflictingSessionIds: idSet };
  }, [activeSessions]);

  const addSubject = (code: string) => {
    const norm = code.replace(/\s+/g, "").toUpperCase();
    if (selectedCodes.includes(norm)) return;

    setSelectedCodes((prev) => [...prev, norm]);

    // Assign color
    const usedColorCount = Object.keys(subjectColors).length;
    const nextColor = COLOR_PALETTE[usedColorCount % COLOR_PALETTE.length];
    setSubjectColorsState((prev) => ({ ...prev, [norm]: nextColor }));

    // Auto-select single-option components (e.g. if there's only 1 lecture choice)
    const subj = allSubjects.find((s) => s.normalizedCode === norm);
    if (subj) {
      const autoPicks: Record<string, string> = {};
      subj.components.forEach((c) => {
        if (c.options.length === 1) {
          autoPicks[c.id] = c.options[0].id;
        }
      });
      if (Object.keys(autoPicks).length > 0) {
        setSelectedOptions((prev) => ({ ...prev, ...autoPicks }));
      }
    }
  };

  const removeSubject = (code: string) => {
    const norm = code.replace(/\s+/g, "").toUpperCase();
    setSelectedCodes((prev) => prev.filter((c) => c !== norm));

    // Clear selections for this subject's components
    const subj = allSubjects.find((s) => s.normalizedCode === norm);
    if (subj) {
      const compIds = new Set(subj.components.map((c) => c.id));
      setSelectedOptions((prev) => {
        const next = { ...prev };
        for (const k of Object.keys(next)) {
          if (compIds.has(k)) {
            delete next[k];
          }
        }
        return next;
      });
    }

    // Clean up color
    setSubjectColorsState((prev) => {
      const next = { ...prev };
      delete next[norm];
      return next;
    });
  };

  const toggleOption = (subjectCode: string, compId: string, optionId: string) => {
    setSelectedOptions((prev) => {
      const isAlready = prev[compId] === optionId;
      const next = { ...prev };

      if (isAlready) {
        delete next[compId];
      } else {
        next[compId] = optionId;

        // Group constraint check:
        // If selecting this option makes other already-selected options in the same subject incompatible,
        // clear the incompatible ones so user isn't stuck with invalid combinations.
        const norm = subjectCode.replace(/\s+/g, "").toUpperCase();
        const subj = allSubjects.find((s) => s.normalizedCode === norm);
        if (subj) {
          const currentOpt = subj.components
            .find((c) => c.id === compId)
            ?.options.find((o) => o.id === optionId);

          if (currentOpt && currentOpt.groupCodes.length > 0) {
            for (const otherComp of subj.components) {
              if (otherComp.id === compId) continue;
              const selectedOtherId = next[otherComp.id];
              if (!selectedOtherId) continue;

              const otherOpt = otherComp.options.find(
                (o) => o.id === selectedOtherId
              );
              if (
                otherOpt &&
                otherOpt.groupCodes.length > 0 &&
                !isOptionCompatible(otherOpt, [currentOpt])
              ) {
                // Incompatible group -> unselect conflicting sibling
                delete next[otherComp.id];
              }
            }
          }
        }
      }

      return next;
    });
  };

  const setSubjectColor = (code: string, color: SubjectColor) => {
    const norm = code.replace(/\s+/g, "").toUpperCase();
    setSubjectColorsState((prev) => ({ ...prev, [norm]: color }));
  };

  const clearAll = () => {
    setSelectedCodes([]);
    setSelectedOptions({});
    setSubjectColorsState({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("Failed to clear localStorage:", err);
    }
  };

  const isOptionSelected = (compId: string, optionId: string) => {
    return selectedOptions[compId] === optionId;
  };

  /**
   * Returns true if option cannot be picked because another selected option
   * in the same subject has a different group tag (e.g. Group A vs Group D)
   */
  const isOptionDisabledDueToGroup = (
    subject: Subject,
    option: ComponentOption
  ): boolean => {
    if (option.groupCodes.length === 0) return false;

    // Collect currently selected options in this subject
    const selectedOptionsInSubject: ComponentOption[] = [];
    for (const comp of subject.components) {
      const selectedId = selectedOptions[comp.id];
      if (!selectedId) continue;
      const opt = comp.options.find((o) => o.id === selectedId);
      if (opt) selectedOptionsInSubject.push(opt);
    }

    return !isOptionCompatible(option, selectedOptionsInSubject);
  };

  return (
    <TimetableContext.Provider
      value={{
        allSubjects,
        selectedSubjects,
        selectedOptions,
        subjectColors,
        weekFilter,
        conflicts,
        conflictingSessionIds,
        activeSessions,
        addSubject,
        removeSubject,
        toggleOption,
        setSubjectColor,
        setWeekFilter,
        clearAll,
        isOptionSelected,
        isOptionDisabledDueToGroup,
      }}
    >
      {children}
    </TimetableContext.Provider>
  );
}

export function useTimetable() {
  const ctx = useContext(TimetableContext);
  if (!ctx) {
    throw new Error("useTimetable must be used within a TimetableProvider");
  }
  return ctx;
}
