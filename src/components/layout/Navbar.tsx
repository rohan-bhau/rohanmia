"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  User2,
  FolderGit2,
  Cpu,
  BookOpen,
  Mail,
  Command as CmdIcon,
  Calendar,
  ChevronDown,
  Image as ImageIcon,
  Code2,
  Search,
  Globe,
  LayoutGrid,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import ColorSwitcher from "@/components/theme/ColorSwitcher";
import { useThemeAccent } from "@/components/theme/ThemeProvider";
import { useBooking } from "@/components/booking/BookingContext";
import AnimatedLogo from "@/components/shared/AnimatedLogo";

const PRIMARY_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "About", href: "/about", icon: User2 },
  { name: "Work", href: "/projects", icon: FolderGit2 },
  { name: "Stack", href: "/tech-stack", icon: Cpu },
];

const MORE_LINKS = [
  {
    name: "Gallery",
    href: "/gallery",
    icon: ImageIcon,
    desc: "Visual moments & snapshots",
  },
  {
    name: "Guestbook",
    href: "/guestbook",
    icon: BookOpen,
    desc: "Leave your note or greeting",
  },
  {
    name: "Links",
    href: "/links",
    icon: Globe,
    desc: "Social profiles & connect hub",
  },
  {
    name: "Contact",
    href: "/contact",
    icon: Mail,
    desc: "Direct message & inquiry",
  },
];

const getCurvedNavPath = (index?: number) => {
  const safeIdx =
    typeof index === "number" && !isNaN(index) && index >= 0 && index <= 4
      ? index
      : 0;
  const cx = 10 + safeIdx * 20;
  const nw = 11.7;
  const p1 = (cx - nw).toFixed(2);
  const p2 = (cx + nw).toFixed(2);
  const cp1_x = (cx - nw + nw * 0.36).toFixed(2);
  const cp2_x = (cx - nw * 0.49).toFixed(2);
  const cp3_x = (cx + nw * 0.49).toFixed(2);
  const cp4_x = (cx + nw - nw * 0.36).toFixed(2);
  const topY = 16;
  const dipY = 43;
  const bottomY = 66;

  return `M 0 50 L 0 ${topY} L ${p1} ${topY} C ${cp1_x} ${topY}, ${cp2_x} ${dipY}, ${cx} ${dipY} C ${cp3_x} ${dipY}, ${cp4_x} ${topY}, ${p2} ${topY} L 100 ${topY} L 100 50 Q 100 ${bottomY} 86 ${bottomY} L 14 ${bottomY} Q 0 ${bottomY} 0 50 Z`;
};

export default function Navbar({ settings }: { settings?: any }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [desktopMoreHovered, setDesktopMoreHovered] = useState(false);
  const [mobileMoreDrawerOpen, setMobileMoreDrawerOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const { currentTheme } = useThemeAccent();
  const { openBooking } = useBooking();

  const handleDesktopMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setDesktopMoreHovered(true);
  };

  const handleDesktopMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setDesktopMoreHovered(false);
    }, 220);
  };

  // Scroll listener for sticky header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMoreDropdownOpen(false);
        setDesktopMoreHovered(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMobileMoreDrawerOpen(false);
      setDesktopMoreHovered(false);
    }, 0);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  // Lock all scrolling completely when mobile "More" drawer is open
  useEffect(() => {
    if (mobileMoreDrawerOpen) {
      const scrollY = window.scrollY;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;
      const originalOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      const blockScroll = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      };

      document.addEventListener("wheel", blockScroll, {
        passive: false,
        capture: true,
      });
      document.addEventListener("touchmove", blockScroll, {
        passive: false,
        capture: true,
      });

      return () => {
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        document.body.style.overflow = originalOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        window.scrollTo(0, scrollY);

        document.removeEventListener("wheel", blockScroll, { capture: true });
        document.removeEventListener("touchmove", blockScroll, {
          capture: true,
        });
      };
    }
  }, [mobileMoreDrawerOpen]);

  // Do not render navbar inside admin dashboard
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isMoreActive = MORE_LINKS.some(
    (item) => pathname === item.href || pathname?.startsWith(`${item.href}/`),
  );

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const MOBILE_TABS = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      isMore: false,
      active: pathname === "/",
    },
    {
      name: "About",
      href: "/about",
      icon: User2,
      isMore: false,
      active: pathname === "/about" || pathname?.startsWith("/about/"),
    },
    {
      name: "Work",
      href: "/projects",
      icon: FolderGit2,
      isMore: false,
      active: pathname === "/projects" || pathname?.startsWith("/projects/"),
    },
    {
      name: "Stack",
      href: "/tech-stack",
      icon: Cpu,
      isMore: false,
      active:
        pathname === "/tech-stack" ||
        pathname?.startsWith("/tech-stack/") ||
        pathname === "/stack",
    },
    {
      name: "More",
      href: "#more",
      icon: LayoutGrid,
      isMore: true,
      active: isMoreActive || mobileMoreDrawerOpen,
    },
  ];

  const activeIndex = MOBILE_TABS.findIndex((tab) => tab.active);
  const safeActiveIndex = activeIndex === -1 ? 0 : activeIndex;
  const activeTab = MOBILE_TABS[safeActiveIndex];
  const ActiveIcon = activeTab.icon;

  return (
    <>
      {/* ========================================================
          TOP HEADER (Desktop + Mobile Brand Bar)
         ======================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "py-2.5 sm:py-3 bg-[#08090a]/85 backdrop-blur-xl border-b border-white/[0.06] shadow-sm"
            : "py-4 sm:py-5 bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="flex items-center justify-between">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-3">
              <Link href="/" className="group flex items-center gap-3">
                <AnimatedLogo
                  size={42}
                  animated={true}
                  className="transition-transform duration-300 group-hover:scale-105 shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight">
                    {settings?.siteName || "Rohan Mia"}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono leading-none pt-0.5">
                    Software Engineer
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Expanding Floating Navigation */}
            <div className="hidden md:flex justify-center items-start relative h-10 w-[360px]">
              <motion.div
                onMouseLeave={handleDesktopMouseLeave}
                animate={{
                  width: desktopMoreHovered ? 540 : 456,
                }}
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 rounded-[24px] bg-[#0c0e13]/95 border border-white/[0.09] backdrop-blur-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
                style={{
                  boxShadow: desktopMoreHovered
                    ? `0 24px 60px -12px rgba(0,0,0,0.85), 0 0 25px ${currentTheme.glow}`
                    : "0 10px 25px -5px rgba(0,0,0,0.4)",
                }}
              >
                {/* Top Row: Primary Navigation (always centered so items NEVER shift when card expands) */}
                <div className="flex items-center justify-center gap-1 px-3 py-1.5 w-full">
                  {PRIMARY_LINKS.map((link) => {
                    const active = isLinkActive(link.href);
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onMouseEnter={() => {
                          if (hoverTimeoutRef.current)
                            clearTimeout(hoverTimeoutRef.current);
                          setDesktopMoreHovered(false);
                        }}
                        onClick={() => setDesktopMoreHovered(false)}
                        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${
                          active
                            ? "text-white font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {active && (
                          <motion.div
                            layoutId="navActivePillDesktop"
                            className="absolute inset-0 rounded-full border border-white/15"
                            style={{
                              backgroundColor: `${currentTheme.primary}22`,
                              boxShadow: `0 0 12px ${currentTheme.glow}`,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}
                        <Icon
                          size={13.5}
                          className={`relative z-10 transition-colors ${
                            active
                              ? "text-white"
                              : "text-neutral-400 group-hover:text-white"
                          }`}
                          style={
                            active ? { color: currentTheme.primary } : undefined
                          }
                        />
                        <span className="relative z-10">{link.name}</span>
                      </Link>
                    );
                  })}

                  {/* Desktop More Trigger - ONLY hovering here opens the mega-menu */}
                  <button
                    onMouseEnter={handleDesktopMouseEnter}
                    onClick={() => setDesktopMoreHovered(!desktopMoreHovered)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      desktopMoreHovered || isMoreActive
                        ? "text-white font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-expanded={desktopMoreHovered}
                  >
                    {(isMoreActive || desktopMoreHovered) && (
                      <motion.div
                        layoutId="navActivePillDesktopMore"
                        className="absolute inset-0 rounded-full border border-white/15"
                        style={{
                          backgroundColor: `${currentTheme.primary}22`,
                          boxShadow: `0 0 12px ${currentTheme.glow}`,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <LayoutGrid
                      size={13.5}
                      className={`relative z-10 transition-colors ${
                        desktopMoreHovered || isMoreActive
                          ? "text-white"
                          : "text-neutral-400"
                      }`}
                      style={
                        desktopMoreHovered || isMoreActive
                          ? { color: currentTheme.primary }
                          : undefined
                      }
                    />
                    <span className="relative z-10">More</span>
                    <ChevronDown
                      size={12}
                      className={`relative z-10 transition-transform duration-250 ${desktopMoreHovered ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {/* Expanded Mega-Menu Body */}
                <AnimatePresence>
                  {desktopMoreHovered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="px-2.5 pb-2.5 pt-1 overflow-hidden"
                    >
                      <div className="grid grid-cols-12 gap-2.5 mt-1">
                        {/* Left Side: 2 Visual Image Cards (cols 7) */}
                        <div className="col-span-7 grid grid-cols-2 gap-2">
                          {/* Card 1: Guestbook */}
                          <Link
                            href="/guestbook"
                            onClick={() => setDesktopMoreHovered(false)}
                            className="group relative h-[134px] rounded-xl overflow-hidden border border-white/[0.08] bg-[#14161b] flex flex-col justify-end p-2.5 transition-all duration-300 hover:border-white/25"
                          >
                            <Image
                              src="/images/about/guestbook-cover.png"
                              alt="Guestbook"
                              fill
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-95"
                              sizes="120px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            <div className="relative z-10">
                              <span className="text-xs font-semibold text-white block group-hover:text-primary transition-colors">
                                Guestbook
                              </span>
                              <span className="text-[10px] text-white/60 block line-clamp-1">
                                Let me know you were here
                              </span>
                            </div>
                          </Link>

                          {/* Card 2: Gallery */}
                          <Link
                            href="/gallery"
                            onClick={() => setDesktopMoreHovered(false)}
                            className="group relative h-[134px] rounded-xl overflow-hidden border border-white/[0.08] bg-[#14161b] flex flex-col justify-end p-2.5 transition-all duration-300 hover:border-white/25"
                          >
                            <Image
                              src="/images/about/gallery-1.jpg"
                              alt="Gallery"
                              fill
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-75 group-hover:opacity-90"
                              sizes="120px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            <div className="relative z-10">
                              <span className="text-xs font-semibold text-white block group-hover:text-primary transition-colors">
                                Gallery
                              </span>
                              <span className="text-[10px] text-white/60 block line-clamp-1">
                                Visual moments & snapshots
                              </span>
                            </div>
                          </Link>
                        </div>

                        {/* Right Side: 3 Destination Links (cols 5) */}
                        <div className="col-span-5 flex flex-col justify-between gap-1">
                          {/* Link 1: Links */}
                          <Link
                            href="/links"
                            onClick={() => setDesktopMoreHovered(false)}
                            className="flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/15 transition-all group"
                          >
                            <div
                              className="size-7 rounded-lg flex items-center justify-center border border-white/10 shrink-0"
                              style={{
                                backgroundColor: `${currentTheme.primary}15`,
                              }}
                            >
                              <Globe
                                size={13}
                                style={{ color: currentTheme.primary }}
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-white group-hover:text-primary transition-colors truncate">
                                Links
                              </span>
                              <span className="text-[9.5px] text-muted-foreground truncate">
                                All my links are here
                              </span>
                            </div>
                          </Link>

                          {/* Link 2: Tech Stack */}
                          <Link
                            href="/tech-stack"
                            onClick={() => setDesktopMoreHovered(false)}
                            className="flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/15 transition-all group"
                          >
                            <div
                              className="size-7 rounded-lg flex items-center justify-center border border-white/10 shrink-0"
                              style={{
                                backgroundColor: `${currentTheme.primary}15`,
                              }}
                            >
                              <Cpu
                                size={13}
                                style={{ color: currentTheme.primary }}
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-white group-hover:text-primary transition-colors truncate">
                                Tech Stack
                              </span>
                              <span className="text-[9.5px] text-muted-foreground truncate">
                                Languages, tools & architecture
                              </span>
                            </div>
                          </Link>

                          {/* Link 3: Contact */}
                          <Link
                            href="/contact"
                            onClick={() => setDesktopMoreHovered(false)}
                            className="flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/15 transition-all group"
                          >
                            <div
                              className="size-7 rounded-lg flex items-center justify-center border border-white/10 shrink-0"
                              style={{
                                backgroundColor: `${currentTheme.primary}15`,
                              }}
                            >
                              <Mail
                                size={13}
                                style={{ color: currentTheme.primary }}
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-white group-hover:text-primary transition-colors truncate">
                                Contact
                              </span>
                              <span className="text-[9.5px] text-muted-foreground truncate">
                                Direct message & inquiry
                              </span>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* CMD+K Palette Trigger (Desktop) */}
              <button
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("open-command-palette", {
                      detail: { view: "search" },
                    }),
                  );
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-mono text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                title="Open Command Palette (Cmd + K)"
              >
                <CmdIcon size={12} />
                <span>K</span>
              </button>

              {/* Mobile Search Trigger */}
              <button
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("open-command-palette", {
                      detail: { view: "search" },
                    }),
                  );
                }}
                className="flex md:hidden p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Search"
                title="Search"
              >
                <Search size={16} />
              </button>

              {/* Multi-Accent Color Switcher */}
              <ColorSwitcher variant="dropdown" />

              {/* Book Call CTA (Desktop) */}
              <button
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("open-command-palette", {
                      detail: { view: "reachout" },
                    }),
                  );
                }}
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
                style={{
                  backgroundColor: currentTheme.primary,
                  color: currentTheme.contrastText,
                  boxShadow: `0 0 16px ${currentTheme.glow}`,
                }}
              >
                <Calendar size={13} />
                <span>Book Call</span>
              </button>

              {/* Mobile Quick Book CTA */}
              <button
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("open-command-palette", {
                      detail: { view: "reachout" },
                    }),
                  );
                }}
                className="flex md:hidden items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-md cursor-pointer"
                style={{
                  backgroundColor: currentTheme.primary,
                  color: currentTheme.contrastText,
                  boxShadow: `0 0 12px ${currentTheme.glow}`,
                }}
                title="Schedule a Call"
              >
                <Calendar size={13} />
                <span className="text-[11px]">Book</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          MOBILE "MORE" DESTINATIONS DRAWER / BOTTOM SHEET
         ======================================================== */}
      <AnimatePresence>
        {mobileMoreDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMoreDrawerOpen(false)}
              onTouchMove={(e) => {
                e.preventDefault();
              }}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md md:hidden overscroll-none touch-none"
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              ref={drawerRef}
              initial={{ y: "100%", opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed bottom-24 left-3 right-3 sm:left-6 sm:right-6 max-w-md mx-auto z-50 md:hidden bg-[#0c0e12]/95 border border-white/[0.12] rounded-[28px] backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] p-4 flex flex-col gap-3.5 max-h-[76vh] overflow-y-auto overscroll-contain touch-pan-y no-scrollbar select-none"
            >
              {/* Top Handle & Header */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-1 rounded-full bg-white/25" />
                <div className="w-full flex items-center justify-between pt-1 pb-2 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      size={14}
                      style={{ color: currentTheme.primary }}
                    />
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                      Explore Destinations
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMoreDrawerOpen(false)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Sub-pages Grid */}
              <div className="grid grid-cols-2 gap-2">
                {MORE_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isCurrent =
                    pathname === link.href ||
                    pathname?.startsWith(`${link.href}/`);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMoreDrawerOpen(false)}
                      className={`relative flex flex-col p-3 rounded-2xl border transition-all duration-200 group overflow-hidden ${
                        isCurrent
                          ? "border-white/20 bg-white/[0.08]"
                          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                      }`}
                    >
                      {/* Active Accent Glow Highlight */}
                      {isCurrent && (
                        <div
                          className="absolute inset-0 opacity-15 pointer-events-none"
                          style={{ backgroundColor: currentTheme.primary }}
                        />
                      )}

                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/10 transition-transform group-hover:scale-110"
                          style={{
                            backgroundColor: `${currentTheme.primary}18`,
                            boxShadow: isCurrent
                              ? `0 0 12px ${currentTheme.glow}`
                              : undefined,
                          }}
                        >
                          <Icon
                            size={15}
                            style={{ color: currentTheme.primary }}
                          />
                        </div>
                        {isCurrent && (
                          <span
                            className="w-2 h-2 rounded-full shadow-sm"
                            style={{
                              backgroundColor: currentTheme.primary,
                              boxShadow: `0 0 8px ${currentTheme.primary}`,
                            }}
                          />
                        )}
                      </div>

                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-semibold tracking-tight transition-colors ${
                            isCurrent
                              ? "text-white"
                              : "text-zinc-200 group-hover:text-white"
                          }`}
                        >
                          {link.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground/80 line-clamp-1 mt-0.5">
                          {link.desc}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Bottom Quick Action: Discovery Call */}
              <div className="pt-2 border-t border-white/[0.08]">
                <button
                  onClick={() => {
                    setMobileMoreDrawerOpen(false);
                    window.dispatchEvent(
                      new CustomEvent("open-command-palette", {
                        detail: { view: "reachout" },
                      }),
                    );
                  }}
                  className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold shadow-lg transition-transform active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: currentTheme.primary,
                    color: currentTheme.contrastText,
                    boxShadow: `0 0 18px ${currentTheme.glow}`,
                  }}
                >
                  <Calendar size={14} />
                  <span>Book 30-Min Discovery Call</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================
          MOBILE BOTTOM NAVIGATION DOCK (Curved Notch & Floating Circle)
         ======================================================== */}
      <nav
        className="fixed bottom-4 inset-x-3 sm:inset-x-8 max-w-md mx-auto z-50 md:hidden select-none pointer-events-auto"
        aria-label="Mobile Navigation"
      >
        <div className="relative w-full h-[66px]">
          {/* SVG Background with animated curved notch */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_16px_36px_rgba(0,0,0,0.85)]"
            viewBox="0 0 100 66"
            preserveAspectRatio="none"
          >
            <motion.path
              d={getCurvedNavPath(safeActiveIndex)}
              animate={{ d: getCurvedNavPath(safeActiveIndex) }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 28,
                mass: 0.8,
              }}
              fill="#0d1117"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Sliding Elevated Active Bubble */}
          <motion.div
            className="absolute top-0 h-full pointer-events-none z-20 flex flex-col items-center justify-between pb-2"
            style={{ width: "20%" }}
            animate={{
              left: `${safeActiveIndex * 20}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 28,
              mass: 0.8,
            }}
          >
            {/* Elevated Circle sitting above the notch with clear gap underneath */}
            <motion.div
              key={activeTab.name}
              initial={{ scale: 0.8, y: 4 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="relative -top-2.5 w-11 h-11 rounded-full bg-[#0d1117] border-2 flex items-center justify-center shadow-lg"
              style={{
                borderColor: currentTheme.primary,
              }}
            >
              <ActiveIcon size={20} style={{ color: currentTheme.primary }} />
            </motion.div>

            {/* Active Label underneath notch */}
            <motion.span
              key={`label-${activeTab.name}`}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[10px] font-semibold tracking-tight leading-none select-none"
              style={{ color: currentTheme.primary }}
            >
              {activeTab.name}
            </motion.span>
          </motion.div>

          {/* 5 Tab Triggers Grid */}
          <div className="grid grid-cols-5 h-full relative z-10 items-center pt-2">
            {MOBILE_TABS.map((tab, idx) => {
              const Icon = tab.icon;
              const isSelected = idx === safeActiveIndex;

              const content = (
                <div className="relative flex flex-col items-center justify-center w-full h-full select-none">
                  <motion.div
                    animate={{
                      opacity: isSelected ? 0 : 1,
                      scale: isSelected ? 0.75 : 1,
                      y: isSelected ? -6 : 0,
                    }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center justify-center gap-1"
                  >
                    <Icon
                      size={18}
                      className="text-zinc-400 group-hover:text-zinc-200 transition-colors"
                    />
                    <span className="text-[10px] tracking-tight leading-none text-zinc-400 group-hover:text-zinc-200 font-medium">
                      {tab.name}
                    </span>
                  </motion.div>
                </div>
              );

              if (tab.isMore) {
                return (
                  <button
                    key={tab.name}
                    onClick={() =>
                      setMobileMoreDrawerOpen(!mobileMoreDrawerOpen)
                    }
                    className="relative flex items-center justify-center w-full h-full cursor-pointer group"
                    aria-label="More options"
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  onClick={() => setMobileMoreDrawerOpen(false)}
                  className="relative flex items-center justify-center w-full h-full group"
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
