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
  Image as ImageIcon,
  Globe,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  LayoutGrid,
  X,
  Bell,
  Eye,
  SlidersHorizontal,
  BarChart3,
} from "lucide-react";
import AnimatedLogo from "@/components/shared/AnimatedLogo";
import { logoutFromControlRoom } from "@/actions/stealthAuth";
import { ToastProvider } from "./ui/Toast";
import { AdminModeProvider, useAdminMode } from "./AdminModeContext";
import { useThemeAccent } from "@/components/theme/ThemeProvider";
import ColorSwitcher from "@/components/theme/ColorSwitcher";
import NotificationDropdown from "./NotificationDropdown";
import { useScrollLock } from "@/hooks/useScrollLock";

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

interface AdminShellProps {
  basePath: string;
  user: {
    name?: string;
    email?: string;
  };
  avatarUrl?: string;
  children: React.ReactNode;
}

function AdminShellContent({
  basePath,
  user,
  avatarUrl,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { currentTheme } = useThemeAccent();
  const { mode, setMode } = useAdminMode();
  const navScrollRef = useRef<HTMLDivElement>(null);

  useScrollLock(mobileDrawerOpen);

  // Close drawer on route change
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setMobileDrawerOpen(false), 0);
    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  // Strict wheel event isolation on sidebar middle section
  useEffect(() => {
    const el = navScrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      if (el.scrollHeight > el.clientHeight) {
        el.scrollTop += e.deltaY;
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const NAV_ITEMS = [
    { name: "Overview", href: `${basePath}/overview`, icon: BarChart3 },
    { name: "Homepage", href: `${basePath}/homepage`, icon: Home },
    { name: "About", href: `${basePath}/about`, icon: User2 },
    { name: "Projects", href: `${basePath}/projects`, icon: FolderGit2 },
    { name: "Stack", href: `${basePath}/tech-stack`, icon: Cpu },
    { name: "Gallery", href: `${basePath}/gallery`, icon: ImageIcon },
    { name: "Guestbook", href: `${basePath}/guestbook`, icon: BookOpen },
    { name: "Links", href: `${basePath}/links`, icon: Globe },
    { name: "Contact", href: `${basePath}/contact`, icon: Mail },
    { name: "Settings", href: `${basePath}/settings`, icon: Settings },
  ];

  const isLinkActive = (href: string) => {
    const cleanHref = href.replace(basePath, "/control-room-internal");
    return (
      pathname === href ||
      pathname === cleanHref ||
      pathname.startsWith(`${cleanHref}/`) ||
      pathname.startsWith(`${href}/`)
    );
  };

  const getPageTitle = () => {
    if (pathname.includes("/overview")) return "Overview & Analytics";
    if (
      pathname.includes("/homepage") ||
      pathname === basePath ||
      pathname === "/control-room-internal"
    )
      return "Homepage";
    if (pathname.includes("/about")) return "About Me";
    if (pathname.includes("/projects")) return "Case Studies";
    if (pathname.includes("/tech-stack")) return "Tech Stack";
    if (pathname.includes("/gallery")) return "Gallery Visuals";
    if (pathname.includes("/guestbook")) return "Guestbook Ledger";
    if (pathname.includes("/links")) return "Social Links";
    if (pathname.includes("/contact")) return "Client Inquiries";
    if (pathname.includes("/settings")) return "Site Settings";
    return "Studio Engine";
  };

  const handleSignOut = async () => {
    await logoutFromControlRoom();
    window.location.reload();
  };

  const ADMIN_MOBILE_TABS = [
    { name: "Overview", href: `${basePath}/overview`, icon: BarChart3 },
    { name: "Home", href: `${basePath}/homepage`, icon: Home },
    { name: "Work", href: `${basePath}/projects`, icon: FolderGit2 },
    { name: "Stack", href: `${basePath}/tech-stack`, icon: Cpu },
    { name: "More", href: "#more", icon: LayoutGrid, isMore: true },
  ];

  const getAdminActiveIndex = () => {
    if (mobileDrawerOpen) return 4;
    if (pathname.includes("/overview")) return 0;
    if (
      pathname.includes("/homepage") ||
      pathname === basePath ||
      pathname === "/control-room-internal"
    )
      return 1;
    if (pathname.includes("/projects")) return 2;
    if (pathname.includes("/tech-stack")) return 3;
    return 4;
  };

  const safeAdminActiveIndex = getAdminActiveIndex();
  const adminActiveTab = ADMIN_MOBILE_TABS[safeAdminActiveIndex];
  const AdminActiveIcon = adminActiveTab.icon;

  return (
    <div
      data-lenis-prevent="true"
      className="min-h-screen bg-transparent text-neutral-200 antialiased selection:bg-white/20 relative"
    >
      {/* Ambient horizon glow */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full blur-[140px] opacity-15 pointer-events-none -z-10 transition-colors duration-700"
        style={{ backgroundColor: currentTheme.primary }}
      />

      {/* ========================================================
          DESKTOP LEFT SIDEBAR (FIXED W-64)
          - Fixed Top Header: Logo + Brand + Border below
          - Middle Scrollable Area: Nav Links only, isolated scroll, no scrollbar
          - Fixed Bottom Footer: Live Site, Profile & Sign Out (Theme removed from here)
         ======================================================== */}
      <aside
        data-lenis-prevent="true"
        className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 z-[60] bg-[#08090d]/95 backdrop-blur-2xl border-r border-white/[0.08] flex-col justify-between select-none"
      >
        {/* 1. FIXED TOP HEADER WITH BORDER BELOW (Exact h-16 matching right top header) */}
        <div className="h-16 shrink-0 px-4 border-b border-white/[0.08] flex items-center justify-between bg-[#08090d]/80">
          <Link
            href={`${basePath}/overview`}
            className="flex items-center gap-2.5 group"
          >
            <AnimatedLogo size={32} animated={true} glow={true} />
            <div className="flex flex-col">
              <span className="font-serif text-base font-medium text-white group-hover:text-white transition-colors leading-tight">
                Rohan Mia
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                Control Room
              </span>
            </div>
          </Link>

          <div
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium"
            style={{
              backgroundColor: `${currentTheme.primary}15`,
              borderColor: `${currentTheme.primary}35`,
              color: currentTheme.primary,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: currentTheme.primary }}
            />
            <span>Live</span>
          </div>
        </div>

        {/* 2. MIDDLE SCROLLABLE NAVIGATION (ISOLATED SCROLL, NO SCROLLBAR) */}
        <div
          ref={navScrollRef}
          data-lenis-prevent="true"
          className="flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-3 space-y-1"
        >
          <p className="px-2 pt-1 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold">
            Studio Navigation
          </p>
          {NAV_ITEMS.map((item) => {
            const active = isLinkActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                style={
                  active
                    ? {
                        backgroundColor: `${currentTheme.primary}18`,
                        borderColor: `${currentTheme.primary}40`,
                        color: "#ffffff",
                      }
                    : undefined
                }
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition-all duration-150 border ${
                  active
                    ? "font-semibold shadow-xs"
                    : "border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    size={15}
                    style={active ? { color: currentTheme.primary } : undefined}
                    className={
                      active
                        ? ""
                        : "text-neutral-400 group-hover:text-neutral-300"
                    }
                  />
                  <span>{item.name}</span>
                </div>

                {active && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: currentTheme.primary,
                      boxShadow: `0 0 6px ${currentTheme.primary}`,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* 3. FIXED BOTTOM FOOTER (Theme moved to top bar, clean public link + profile) */}
        <div className="shrink-0 p-3.5 border-t border-white/[0.08] space-y-2.5 bg-[#08090d]/90">
          {/* Public Site Link */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-mono text-neutral-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Globe size={13} className="text-neutral-400" />
              <span>View Public Site</span>
            </div>
            <ExternalLink size={12} className="text-neutral-400" />
          </Link>

          {/* Profile & Sign Out Bar */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={user.name || "Admin"}
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-lg object-cover shrink-0 border border-white/10"
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold text-white shrink-0"
                  style={{
                    backgroundColor: `${currentTheme.primary}30`,
                    borderColor: `${currentTheme.primary}50`,
                  }}
                >
                  RM
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-medium text-white truncate leading-tight">
                  {user.name || "Admin"}
                </p>
                <p className="text-[10px] font-mono text-neutral-400 truncate leading-tight">
                  {user.email || "Admin"}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all shrink-0 cursor-pointer"
              title="Sign out of admin session"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================
          MOBILE HEADER BAR (< md) - Matched to h-16
         ======================================================== */}
      <header className="h-16 md:hidden sticky top-0 left-0 right-0 z-[60] bg-[#08090d]/95 backdrop-blur-xl border-b border-white/[0.08] px-4 flex items-center justify-between">
        <Link href={basePath} className="flex items-center gap-2.5 group">
          <AnimatedLogo size={30} animated={true} glow={true} />
          <div className="flex flex-col">
            <span className="font-serif text-sm font-medium text-white leading-tight">
              Rohan Mia
            </span>
            <span className="text-[10px] font-mono text-neutral-400 leading-tight">
              Control Room
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Mode Switcher (Surface Canvas vs Studio Engine) on Mobile */}
          {!pathname.includes("/overview") &&
            !pathname.includes("/gallery") &&
            !pathname.includes("/guestbook") &&
            !pathname.includes("/contact") &&
            !pathname.includes("/tech-stack") &&
            !pathname.includes("/projects") && (
              <div className="flex items-center p-0.5 rounded-xl border border-white/[0.12] bg-white/[0.04]">
                <button
                  type="button"
                  onClick={() => setMode("preview")}
                  style={
                    mode === "preview"
                      ? {
                          backgroundColor: `${currentTheme.primary}25`,
                          borderColor: `${currentTheme.primary}50`,
                          color: "#ffffff",
                        }
                      : undefined
                  }
                  className={`p-1.5 rounded-lg transition-all border cursor-pointer ${
                    mode === "preview"
                      ? "shadow-xs"
                      : "border-transparent text-neutral-400 hover:text-white"
                  }`}
                  title="Surface Canvas (Preview)"
                  aria-label="Surface Canvas"
                >
                  <Eye
                    size={13}
                    style={
                      mode === "preview"
                        ? { color: currentTheme.primary }
                        : undefined
                    }
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setMode("studio")}
                  style={
                    mode === "studio"
                      ? {
                          backgroundColor: `${currentTheme.primary}25`,
                          borderColor: `${currentTheme.primary}50`,
                          color: "#ffffff",
                        }
                      : undefined
                  }
                  className={`p-1.5 rounded-lg transition-all border cursor-pointer ${
                    mode === "studio"
                      ? "shadow-xs"
                      : "border-transparent text-neutral-400 hover:text-white"
                  }`}
                  title="Studio Engine (Edit)"
                  aria-label="Studio Engine"
                >
                  <SlidersHorizontal
                    size={13}
                    style={
                      mode === "studio"
                        ? { color: currentTheme.primary }
                        : undefined
                    }
                  />
                </button>
              </div>
            )}

          <ColorSwitcher variant="dropdown" />
          <NotificationDropdown basePath={basePath} />
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ========================================================
          MAIN CANVAS AREA
          - Gets md:pl-64 on desktop so it sits right of the sidebar
          - Features a STICKY TOP COMMAND BAR that never overlaps sidebar
         ======================================================== */}
      <div className="md:pl-64 min-h-screen flex flex-col relative">
        {/* GLOBAL TOP COMMAND HEADER - Desktop only (Exact h-16 matching left sidebar header) */}
        <header className="hidden md:flex h-16 sticky top-0 z-[60] w-full backdrop-blur-xl border-b border-white/[0.08] px-3 sm:px-8 items-center justify-between gap-4 select-none">
          {/* Left: Minimalist Elegant Page Indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono tracking-wider text-neutral-400 uppercase">
              Studio
            </span>
            <span className="text-neutral-600">/</span>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: currentTheme.primary }}
              />
              <h1 className="text-sm font-serif font-medium text-white tracking-wide">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Middle: Mode Switcher (Surface Canvas vs Studio Engine) */}
          {!pathname.includes("/overview") &&
          !pathname.includes("/gallery") &&
          !pathname.includes("/guestbook") &&
          !pathname.includes("/contact") &&
          !pathname.includes("/tech-stack") &&
          !pathname.includes("/projects") ? (
            <div className="flex items-center p-1 rounded-2xl border border-white/[0.12] bg-white/[0.03] backdrop-blur-md">
              <button
                type="button"
                onClick={() => setMode("preview")}
                style={
                  mode === "preview"
                    ? {
                        backgroundColor: `${currentTheme.primary}25`,
                        borderColor: `${currentTheme.primary}50`,
                        color: "#ffffff",
                      }
                    : undefined
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
                  mode === "preview"
                    ? "font-medium shadow-xs"
                    : "border-transparent text-neutral-400 hover:text-white"
                }`}
              >
                <Eye
                  size={13}
                  style={
                    mode === "preview"
                      ? { color: currentTheme.primary }
                      : undefined
                  }
                />
                <span>Surface Canvas</span>
              </button>

              <button
                type="button"
                onClick={() => setMode("studio")}
                style={
                  mode === "studio"
                    ? {
                        backgroundColor: `${currentTheme.primary}25`,
                        borderColor: `${currentTheme.primary}50`,
                        color: "#ffffff",
                      }
                    : undefined
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
                  mode === "studio"
                    ? "font-medium shadow-xs"
                    : "border-transparent text-neutral-400 hover:text-white"
                }`}
              >
                <SlidersHorizontal
                  size={13}
                  style={
                    mode === "studio"
                      ? { color: currentTheme.primary }
                      : undefined
                  }
                />
                <span>Studio Engine</span>
              </button>
            </div>
          ) : (
            <div className="hidden md:block" />
          )}

          {/* Right: Theme Switcher + Quick Live Site + Notification Bell - Hidden on mobile (already in top mobile header) */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <div className="hidden sm:block">
              <ColorSwitcher variant="dropdown" />
            </div>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-xs font-mono text-neutral-300 hover:text-white transition-colors"
            >
              <span>Live View</span>
              <ExternalLink size={11} className="text-neutral-400" />
            </Link>

            {/* Notification Bell Dropdown */}
            <NotificationDropdown basePath={basePath} />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 pb-32 md:pb-16 pt-0">{children}</main>
      </div>

      {/* ========================================================
          MOBILE "MORE" STUDIO DESTINATIONS DRAWER / BOTTOM SHEET
         ======================================================== */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md md:hidden overscroll-none touch-none"
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: "100%", opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed bottom-24 left-3 right-3 sm:left-6 sm:right-6 max-w-md mx-auto z-50 md:hidden bg-[#0c0e12]/95 border border-white/[0.12] rounded-[28px] backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] p-4 flex flex-col gap-3.5 max-h-[76vh] overflow-y-auto overscroll-contain select-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Handle & Header */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-1 rounded-full bg-white/25" />
                <div className="w-full flex items-center justify-between pt-1 pb-2 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={15}
                      style={{ color: currentTheme.primary }}
                    />
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                      Control Room Studio
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Studio Panels Grid */}
              <div className="grid grid-cols-2 gap-2">
                {NAV_ITEMS.filter(
                  (item) =>
                    !["Overview", "Homepage", "Projects", "Stack"].includes(
                      item.name,
                    ),
                ).map((item) => {
                  const Icon = item.icon;
                  const active = isLinkActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`relative flex flex-col p-3 rounded-2xl border transition-all duration-200 group overflow-hidden ${
                        active
                          ? "border-white/20 bg-white/[0.08]"
                          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                      }`}
                    >
                      {active && (
                        <div
                          className="absolute inset-0 opacity-15 pointer-events-none"
                          style={{ backgroundColor: currentTheme.primary }}
                        />
                      )}

                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/10"
                          style={{
                            backgroundColor: `${currentTheme.primary}18`,
                            boxShadow: active
                              ? `0 0 12px ${currentTheme.primary}40`
                              : undefined,
                          }}
                        >
                          <Icon
                            size={15}
                            style={{ color: currentTheme.primary }}
                          />
                        </div>
                        {active && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: currentTheme.primary,
                              boxShadow: `0 0 8px ${currentTheme.primary}`,
                            }}
                          />
                        )}
                      </div>

                      <span
                        className={`text-xs font-semibold tracking-tight transition-colors ${
                          active
                            ? "text-white"
                            : "text-zinc-200 group-hover:text-white"
                        }`}
                      >
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Bottom Actions: View Public Site + Sign Out */}
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-white"
                >
                  <Globe size={13} className="text-neutral-400" />
                  <span>Public Site</span>
                  <ExternalLink size={11} className="text-neutral-400" />
                </Link>

                <button
                  onClick={handleSignOut}
                  className="text-rose-400 hover:text-rose-300 cursor-pointer inline-flex items-center gap-1"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
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
        className="fixed bottom-4 inset-x-3 sm:inset-x-8 max-w-md mx-auto z-[60] md:hidden select-none pointer-events-auto"
        aria-label="Admin Mobile Navigation"
      >
        <div className="relative w-full h-[66px]">
          {/* SVG Background with animated curved notch */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_16px_36px_rgba(0,0,0,0.85)]"
            viewBox="0 0 100 66"
            preserveAspectRatio="none"
          >
            <motion.path
              d={getCurvedNavPath(safeAdminActiveIndex)}
              animate={{ d: getCurvedNavPath(safeAdminActiveIndex) }}
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
              left: `${safeAdminActiveIndex * 20}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 28,
              mass: 0.8,
            }}
          >
            {/* Elevated Circle sitting above notch with clear gap */}
            <motion.div
              key={adminActiveTab.name}
              initial={{ scale: 0.8, y: 4 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="relative -top-2.5 w-11 h-11 rounded-full bg-[#0d1117] border-2 flex items-center justify-center shadow-lg"
              style={{
                borderColor: currentTheme.primary,
              }}
            >
              <AdminActiveIcon
                size={20}
                style={{ color: currentTheme.primary }}
              />
            </motion.div>

            {/* Active Label underneath notch */}
            <motion.span
              key={`label-${adminActiveTab.name}`}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[10px] font-semibold tracking-tight leading-none select-none"
              style={{ color: currentTheme.primary }}
            >
              {adminActiveTab.name}
            </motion.span>
          </motion.div>

          {/* 5 Tab Triggers Grid */}
          <div className="grid grid-cols-5 h-full relative z-10 items-center pt-2">
            {ADMIN_MOBILE_TABS.map((tab, idx) => {
              const Icon = tab.icon;
              const isSelected = idx === safeAdminActiveIndex;

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
                    type="button"
                    onClick={() => setMobileDrawerOpen((prev) => !prev)}
                    className="group relative flex flex-col items-center justify-center w-full h-full cursor-pointer focus:outline-none"
                    aria-label="Open Studio Menu"
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  prefetch={true}
                  onClick={() => setMobileDrawerOpen(false)}
                  className="group relative flex flex-col items-center justify-center w-full h-full cursor-pointer focus:outline-none"
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default function AdminShell(props: AdminShellProps) {
  return (
    <ToastProvider>
      <AdminModeProvider basePath={props.basePath}>
        <AdminShellContent {...props} />
      </AdminModeProvider>
    </ToastProvider>
  );
}
