// src/lib/parser.ts

export interface RawTimetableEntry {
  semester_id: number;
  subject_code: string;
  subject_name: string;
  subject_name_full: string;
  week_day: string;
  start_time: string;
  end_time: string;
  location: string;
  type: string;
  type_with_section: string;
  type_full: string;
  subject_selection_option: string;
  lecturer: string;
  session_start_date?: string;
  session_end_date?: string;
  subject_details?: {
    description?: string | null;
    faculty_name?: {
      title: string;
    };
    courses?: Array<{
      name: string;
    }>;
  };
}

export interface ClassSession {
  id: string;
  typeFull: string;
  subjectCode: string;
  subjectName: string;
  componentType: string;
  day: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  location: string;
  lecturer: string;
  weekType: "all" | "odd" | "even" | "dates";
  scheduleNote?: string;
  groupCodes: string[];
}

export interface ComponentOption {
  id: string; // e.g. "AUTM-BUS 030-DB-L/1"
  typeFull: string;
  name: string; // e.g. "Lecture (Groups A,B,C)"
  componentType: string;
  groupCodes: string[];
  isGrouped: boolean;
  sessions: ClassSession[];
}

export interface ComponentGroup {
  id: string;
  name: string; // e.g. "Lecture", "Tutorial"
  index: number;
  required: boolean;
  options: ComponentOption[];
}

export interface Subject {
  code: string;
  normalizedCode: string;
  name: string;
  faculty: string;
  degrees: string[];
  description?: string;
  components: ComponentGroup[];
}

/**
 * Guarantees strict HH:mm formatting with leading zeros (e.g. "08:30")
 */
export function padTimeHHMM(timeStr: string): string {
  if (!timeStr) return "";
  const parts = timeStr.trim().split(":");
  if (parts.length < 2) return timeStr;
  const h = parts[0].padStart(2, "0");
  const m = parts[1].padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Extracts group letters or numbers from annotations like:
 * "(Groups A,B,C)", "(Group A&B)", "(Class 1)", "(Group 2)"
 */
export function extractGroupCodes(text: string): string[] {
  if (!text) return [];

  const groupMatch = text.match(/\((?:Groups?|Class)\s*([A-Za-z0-9,\s&]+)\)/i);
  if (!groupMatch) return [];

  const raw = groupMatch[1];
  const tokens = raw
    .split(/[,&]|\band\b/i)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  return Array.from(new Set(tokens));
}

/**
 * Detects week recurrence: Odd Weeks only, Even Weeks only, or specific dates
 */
export function extractWeekType(text: string): {
  weekType: "all" | "odd" | "even" | "dates";
  scheduleNote?: string;
} {
  if (!text) return { weekType: "all" };

  if (/\bodd\s*weeks?\b/i.test(text)) {
    return { weekType: "odd", scheduleNote: "Odd Weeks Only" };
  }
  if (/\beven\s*weeks?\b/i.test(text)) {
    return { weekType: "even", scheduleNote: "Even Weeks Only" };
  }

  const dateMatch = text.match(/\((?:Scheduled on\s*)?([0-9]{1,2}\s+[A-Za-z]+(?:,\s*[0-9]{1,2}\s+[A-Za-z]+)*)\)/i);
  if (dateMatch) {
    return { weekType: "dates", scheduleNote: dateMatch[1] };
  }

  return { weekType: "all" };
}

/**
 * Creates a clean, concise label for a component option
 * (e.g. "Lecture (Groups A,B,C)" instead of "Business Studies Lecture (Groups A,B,C)")
 */
export function buildOptionLabel(
  componentType: string,
  typeWithSection: string,
  subjectNameFull: string
): string {
  // Extract group or note suffix e.g. "(Group A)" or "(Odd Weeks)"
  const suffixMatch = subjectNameFull.match(/\(([^)]+)\)/);
  const suffix = suffixMatch ? ` (${suffixMatch[1]})` : "";

  const section = (typeWithSection || "").trim();
  if (section && !section.toLowerCase().includes(componentType.toLowerCase())) {
    return `${componentType} ${section}${suffix}`.trim();
  } else if (section) {
    return `${section}${suffix}`.trim();
  }

  return `${componentType}${suffix}`.trim();
}

/**
 * Parses raw timetable entries into high-level Subject structures
 * following the sequential (line 1 OR line 2) AND (line 3) ... CNF logic.
 */
export function parseTimetableData(rawEntries: RawTimetableEntry[]): Subject[] {
  const subjectMap = new Map<string, RawTimetableEntry[]>();
  const subjectMeta = new Map<
    string,
    {
      code: string;
      name: string;
      faculty: string;
      degrees: string[];
      description?: string;
    }
  >();

  for (const entry of rawEntries) {
    const rawCode = (entry.subject_code || "").trim();
    if (!rawCode) continue;

    const normCode = rawCode.replace(/\s+/g, "").toUpperCase();

    if (!subjectMap.has(normCode)) {
      subjectMap.set(normCode, []);

      const faculty =
        entry.subject_details?.faculty_name?.title || "UOWD Faculty";
      const degrees = (entry.subject_details?.courses || [])
        .map((c) => c.name)
        .filter(Boolean);
      const description = entry.subject_details?.description || undefined;

      subjectMeta.set(normCode, {
        code: rawCode,
        name: (entry.subject_name || rawCode).trim(),
        faculty: faculty.trim(),
        degrees: Array.from(new Set(degrees)),
        description,
      });
    }

    subjectMap.get(normCode)!.push(entry);
  }

  const subjects: Subject[] = [];

  for (const [normCode, entries] of subjectMap.entries()) {
    const meta = subjectMeta.get(normCode)!;

    // Segment entries into component groups based on AND / OR logic:
    const rawComponentBlocks: RawTimetableEntry[][] = [];
    let currentBlock: RawTimetableEntry[] = [];

    for (const entry of entries) {
      const opt = (entry.subject_selection_option || "").trim().toUpperCase();

      if (opt === "OR" && currentBlock.length > 0) {
        currentBlock.push(entry);
      } else {
        if (currentBlock.length > 0) {
          rawComponentBlocks.push(currentBlock);
        }
        currentBlock = [entry];
      }
    }
    if (currentBlock.length > 0) {
      rawComponentBlocks.push(currentBlock);
    }

    const componentGroups: ComponentGroup[] = rawComponentBlocks.map(
      (block, compIndex) => {
        const primaryType = (block[0].type || "Class").trim();

        // Group rows inside the block by type_full
        const optionMap = new Map<string, RawTimetableEntry[]>();
        for (const r of block) {
          const key = r.type_full || `${r.subject_code}-${compIndex}-${r.week_day}-${r.start_time}`;
          if (!optionMap.has(key)) {
            optionMap.set(key, []);
          }
          optionMap.get(key)!.push(r);
        }

        const options: ComponentOption[] = Array.from(optionMap.entries()).map(
          ([typeFull, rows]) => {
            const firstRow = rows[0];
            const fullName = firstRow.subject_name_full || firstRow.subject_name || "";
            const groupCodes = extractGroupCodes(fullName);
            const cleanName = buildOptionLabel(primaryType, firstRow.type_with_section, fullName);

            const sessions: ClassSession[] = rows.map((row, sIndex) => {
              const rowFullName = row.subject_name_full || fullName;
              const { weekType, scheduleNote } = extractWeekType(rowFullName);

              return {
                id: `${typeFull}-${row.week_day}-${row.start_time}-${sIndex}`,
                typeFull,
                subjectCode: meta.code,
                subjectName: meta.name,
                componentType: (row.type || primaryType).trim(),
                day: (row.week_day || "").trim(),
                startTime: padTimeHHMM(row.start_time),
                endTime: padTimeHHMM(row.end_time),
                location: (row.location || "TBA").trim(),
                lecturer: (row.lecturer || "TBA").trim(),
                weekType,
                scheduleNote,
                groupCodes,
              };
            });

            return {
              id: typeFull,
              typeFull,
              name: cleanName,
              componentType: primaryType,
              groupCodes,
              isGrouped: groupCodes.length > 0,
              sessions,
            };
          }
        );

        return {
          id: `${normCode}-comp-${compIndex}`,
          name: primaryType,
          index: compIndex,
          required: true,
          options,
        };
      }
    );

    subjects.push({
      code: meta.code,
      normalizedCode: normCode,
      name: meta.name,
      faculty: meta.faculty,
      degrees: meta.degrees,
      description: meta.description,
      components: componentGroups,
    });
  }

  // Sort subjects alphabetically by code
  subjects.sort((a, b) => a.normalizedCode.localeCompare(b.normalizedCode));

  return subjects;
}

/**
 * Checks whether an option is compatible with already selected options in the subject.
 */
export function isOptionCompatible(
  option: ComponentOption,
  selectedOptionsInSubject: ComponentOption[]
): boolean {
  if (option.groupCodes.length === 0) return true;

  for (const selected of selectedOptionsInSubject) {
    if (selected.id === option.id) continue;
    if (selected.groupCodes.length === 0) continue;

    const hasCommonGroup = option.groupCodes.some((code) =>
      selected.groupCodes.includes(code)
    );
    if (!hasCommonGroup) {
      return false;
    }
  }

  return true;
}

/**
 * Time utility: converts HH:mm to minutes since midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":").map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return 0;
  return parts[0] * 60 + parts[1];
}

/**
 * Formats minutes since midnight into HH:mm with strict 2-digit padding
 */
export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Checks if two sessions collide in time AND run on overlapping weeks.
 */
export function doSessionsConflict(
  a: ClassSession,
  b: ClassSession
): boolean {
  if (a.id === b.id) return false;
  if (a.day !== b.day) return false;

  // Odd only and Even only NEVER conflict
  if (
    (a.weekType === "odd" && b.weekType === "even") ||
    (a.weekType === "even" && b.weekType === "odd")
  ) {
    return false;
  }

  // Time overlap
  const startA = timeToMinutes(a.startTime);
  const endA = timeToMinutes(a.endTime);
  const startB = timeToMinutes(b.startTime);
  const endB = timeToMinutes(b.endTime);

  return startA < endB && startB < endA;
}
