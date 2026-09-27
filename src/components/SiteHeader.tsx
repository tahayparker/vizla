"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import {
  CalendarRange,
  DoorOpen,
  CalendarCheck,
  BookOpen,
} from "lucide-react";
import { KeyboardKeys, AriaAnnouncer } from "@/lib/accessibility";
import { qurovaFont } from "@/lib/fonts";

const navItems = [
  {
    name: "Create",
    href: "/create",
    icon: CalendarRange,
  },
];
type NavItemType = (typeof navItems)[0];

const projectLinks = [
  {
    name: "vacansee",
    href: "https://vacansee.vercel.app/",
    icon: DoorOpen,
  },
  {
    name: "vaila",
    href: "https://vaila.vercel.app/",
    icon: CalendarCheck,
  },
];

const NavLink = React.forwardRef<
  React.ElementRef<"li">,
  Omit<React.ComponentPropsWithoutRef<typeof Link>, "href" | "children"> & {
    item: NavItemType;
    isMobile?: boolean;
    isDesktop?: boolean;
    currentPath: string;
    isHovered: boolean;
    onHoverStart: () => void;
    onHoverEnd: () => void;
    onClick?: () => void;
  }
>(
  (
    {
      className,
      item,
      isMobile,
      isDesktop,
      currentPath,
      isHovered,
      onHoverStart,
      onHoverEnd,
      onClick,
    },
    ref,
  ) => {
    const isActuallyActive = item.href === currentPath;
    const labelTransition: Transition = { duration: 0.2, ease: "easeInOut" };

    if (isMobile) {
      return (
        <li ref={ref}>
          <Link
            href={item.href}
            className={
              "flex items-center gap-3 w-full p-3 rounded-md transition-colors duration-200 ease-in-out " +
              (isActuallyActive
                ? "text-purple-500 font-semibold bg-white/5"
                : "text-white/80 hover:text-white hover:bg-white/10 ") +
              (className ?? "")
            }
            onClick={onClick}
            aria-current={isActuallyActive ? "page" : undefined}
          >
            {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
            <span className="flex-grow text-base">{item.name}</span>
          </Link>
        </li>
      );
    }

    if (isDesktop) {
      const showActiveState = isHovered || isActuallyActive;
      const textColorClass = isHovered
        ? "text-white"
        : isActuallyActive
          ? "text-white/90"
          : "text-white/70";

      return (
        <motion.li
          ref={ref}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
          className="flex"
        >
          <Link
            href={item.href}
            aria-current={isActuallyActive ? "page" : undefined}
            className={
              `relative flex items-center justify-center rounded-full transition-colors duration-200 ease-in-out overflow-hidden ` +
              (showActiveState
                ? `bg-white/10 px-3 py-1.5 `
                : `p-2 hover:bg-white/10 `) +
              textColorClass +
              (className ?? "")
            }
          >
            {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
            <AnimatePresence>
              {showActiveState && (
                <motion.span
                  key="label"
                  initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                  animate={{
                    width: "auto",
                    opacity: 1,
                    marginLeft: "0.375rem",
                  }}
                  exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                  transition={labelTransition}
                  className="text-sm font-medium whitespace-nowrap"
                  style={{ lineHeight: "normal" }}
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </motion.li>
      );
    }
    return <li ref={ref}></li>;
  },
);
NavLink.displayName = "NavLink";

export default function SiteHeader() {
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const currentPath = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentPath]);

  const menuToggleTransition: Transition = { duration: 0.2 };
  const mobilePanelTransition: Transition = { duration: 0.2, ease: "easeOut" };
  const mobileBackdropTransition: Transition = { duration: 0.2, ease: "linear" };
  const labelTransition: Transition = { duration: 0.2, ease: "easeInOut" };

  return (
    <>
      <header
        className={
          "fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-4 sm:px-6 md:px-8 bg-black/5 backdrop-blur-lg border-b border-white/10"
        }
        role="banner"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="flex-shrink-0 z-10 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-white font-semibold transition-opacity hover:opacity-80"
          >
            <CalendarRange className="h-6 w-6 text-purple-500" />
            <span className={`sm:inline text-xl mt-1 ${qurovaFont.className}`}>
              vizla
            </span>
          </Link>
        </div>

        {isMounted && (
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop Navigation */}
            <nav
              className="hidden md:flex items-center"
              role="navigation"
              aria-label="Main navigation"
            >
              <ul className="flex items-center gap-x-1" role="menubar">
                {navItems.map((navItem) => (
                  <NavLink
                    key={navItem.href}
                    item={navItem}
                    isDesktop={true}
                    currentPath={currentPath}
                    isHovered={hoveredHref === navItem.href}
                    onHoverStart={() => setHoveredHref(navItem.href)}
                    onHoverEnd={() => setHoveredHref(null)}
                  />
                ))}
              </ul>
            </nav>

            {/* Desktop Cross-links */}
            <div className="hidden md:flex items-center gap-1 ml-1 h-10">
              {projectLinks.map((project) => {
                const isHovered = hoveredHref === project.href;
                return (
                  <motion.a
                    key={project.href}
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onHoverStart={() => setHoveredHref(project.href)}
                    onHoverEnd={() => setHoveredHref(null)}
                    className={
                      `relative flex items-center justify-center rounded-full transition-colors duration-200 ease-in-out overflow-hidden ` +
                      (isHovered
                        ? `bg-white/10 px-3 py-1.5 text-white`
                        : `p-2 hover:bg-white/10 text-white/70`)
                    }
                    aria-label={`Open ${project.name}`}
                  >
                    <project.icon className="h-5 w-5 flex-shrink-0 text-purple-500" />
                    <AnimatePresence>
                      {isHovered && (
                        <motion.span
                          key={`${project.name}-label`}
                          initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                          animate={{
                            width: "auto",
                            opacity: 1,
                            marginLeft: "0.375rem",
                          }}
                          exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                          transition={labelTransition}
                          className="text-sm font-medium whitespace-nowrap"
                          style={{ lineHeight: "normal" }}
                        >
                          {project.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.a>
                );
              })}
            </div>

            {/* Mobile Menu Trigger */}
            <div className="flex md:hidden ml-1">
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                onKeyDown={(e) => {
                  if (
                    e.key === KeyboardKeys.ENTER ||
                    e.key === KeyboardKeys.SPACE
                  ) {
                    e.preventDefault();
                    setIsMenuOpen(!isMenuOpen);
                    AriaAnnouncer.getInstance().announce(
                      isMenuOpen ? "Menu closed" : "Menu opened",
                    );
                  }
                }}
                className="relative z-[65] flex flex-col justify-center items-center gap-[7px] p-2 rounded-full transition-colors cursor-pointer"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="w-5 h-px bg-white block rounded-full"
                  animate={
                    isMenuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }
                  }
                  transition={menuToggleTransition}
                />
                <motion.span
                  className="w-5 h-px bg-white block rounded-full"
                  animate={
                    isMenuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }
                  }
                  transition={menuToggleTransition}
                />
              </motion.button>
            </div>
          </div>
        )}

        {/* Placeholder if not mounted */}
        {!isMounted && (
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden md:block w-24 h-8 bg-white/5 rounded-full animate-pulse" />
            <div className="w-8 h-8 bg-white/5 rounded-full animate-pulse md:hidden" />
          </div>
        )}
      </header>

      {/* Conditionally render mobile menu panel and backdrop */}
      <AnimatePresence>
        {isMounted && isMenuOpen && (
          <motion.div
            key="mobile-backdrop"
            className="fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={mobileBackdropTransition}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isMounted && isMenuOpen && (
          <motion.div
            key="mobile-menu-panel"
            id="mobile-menu"
            role="menu"
            aria-label="Mobile navigation menu"
            className={
              "fixed inset-x-4 top-20 z-50 md:hidden bg-gradient-to-br from-black/80 to-black/90 backdrop-blur-xl border border-white/15 shadow-xl rounded-lg overflow-hidden"
            }
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={mobilePanelTransition}
          >
            <div className="max-h-[calc(100vh-6rem)] overflow-y-auto p-4 flex flex-col">
              <nav>
                <ul className="flex flex-col gap-2">
                  {navItems.map((navItem) => (
                    <NavLink
                      key={navItem.href}
                      item={navItem}
                      isMobile={true}
                      currentPath={currentPath}
                      isHovered={false}
                      onHoverStart={() => {}}
                      onHoverEnd={() => {}}
                      onClick={() => setIsMenuOpen(false)}
                    />
                  ))}
                  <li>
                    <Link
                      href="/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 w-full p-3 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 ease-in-out"
                    >
                      <BookOpen className="h-5 w-5 flex-shrink-0" />
                      <span className="flex-grow text-base">Docs</span>
                    </Link>
                  </li>
                </ul>
              </nav>
              <div className="h-px bg-white/20 my-3" />
              <div className="mt-auto flex flex-col gap-2">
                {projectLinks.map((project) => (
                  <a
                    key={project.href}
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 w-full p-3 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 ease-in-out"
                  >
                    <project.icon className="h-5 w-5 flex-shrink-0 text-purple-500" />
                    <span className="flex-grow text-base">
                      {project.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
