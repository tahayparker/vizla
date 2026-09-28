# vizla

> Interactive course timetable planner, group constraint solver, and scheduling conflict detector for University of Wollongong in Dubai (UOWD).

---

## Overview

**vizla** is designed specifically for UOWD students to make course timetable planning and semester scheduling effortless. Instead of manually cross-referencing PDF timetables, calculating overlapping timeslots, and deciphering group restrictions, vizla validates every component in real time so you can design your ideal weekly schedule in seconds.

## Key Features

- **Full Course Catalog**: Instant search and filtering across subjects, lectures, tutorials, computer labs, and workshops.
- **Group & Class Constraint Solver**: Automatically resolves linked component groups (e.g., Lecture 1 requiring Tutorial Groups A, B, or C). Incompatible alternatives are automatically detected.
- **Odd & Even Week Cycles**: Accounts for alternating fortnightly labs and tutorials according to the official UOWD academic calendar.
- **Live Conflict Detection**: Instant visual flags and banners for any overlapping sessions sharing the same time slot and day cycle.
- **Distinct Color Identifiers**: Distinguishable color themes for each course for seamless calendar identification.
- **Local Storage Persistence**: Your selected timetable is saved automatically and restored across browser sessions.
- **High-Resolution PNG Export**: One-click export to download a clean, formatted timetable image.
- **Modern Responsive Design**: Optimized for desktop and mobile with an interactive WebGL plasma shader background.

## Tech Stack

- **Framework**: Next.js 16 (App Router & Turbopack)
- **UI & Styling**: React 19, Tailwind CSS 4, Lucide React, Framer Motion
- **Shader / Visuals**: WebGL Plasma Shader powered by OGL
- **Export**: html2canvas-pro

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/tahayparker/vizla.git
cd vizla

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build for Production

```bash
npm run build
npm run start
```

## Related Projects

- [**UOWD-timetable-visualizer**](github.com/adakidpv/UOWD-timetable-visualizer) - The OG project that prompted this
- [**vacansee**](https://github.com/tahayparker/vacansee) - Real-time classroom and campus room vacancy tracker.
- [**vaila**](https://github.com/tahayparker/vaila) - Faculty timetable and teacher schedule visualizer.

## Author

- **Taha Parker** - [Website](https://tahayparker.vercel.app) · [GitHub](https://github.com/tahayparker)
