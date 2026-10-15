"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  CalendarDays,
  CheckSquare,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  Target,
  Flame,
  Lightbulb,
  MousePointerClick,
  Wrench,
  BookA,
} from "lucide-react";
import { ThemeController } from "@/components/theme-controller";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  subItems?: Array<{ label: string; href: string; icon: React.ComponentType<{ className?: string }> }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Foundation",
    href: "/foundation/niche",
    icon: Compass,
    subItems: [
      { label: "Niche & Ikigai", href: "/foundation/niche", icon: Target },
      { label: "Audience (ICP)", href: "/foundation/audience", icon: Users },
    ],
  },
  {
    label: "Planner 3-3-1",
    href: "/planner",
    icon: CalendarDays,
    badge: "336 Slot",
  },
  {
    label: "Batch Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    label: "Performance",
    href: "/tracker",
    icon: BarChart3,
  },
  {
    label: "Asset Library",
    href: "/library/hooks",
    icon: BookOpen,
    badge: "385",
    subItems: [
      { label: "Hook Bank (105)", href: "/library/hooks", icon: Flame },
      { label: "Idea Bank (104)", href: "/library/ideas", icon: Lightbulb },
      { label: "CTA-CTV (45)", href: "/library/cta", icon: MousePointerClick },
      { label: "Tools Ngonten (31)", href: "/library/tools", icon: Wrench },
      { label: "Kamus Istilah (100)", href: "/library/glossary", icon: BookA },
    ],
  },
];

const MOBILE_NAV_ITEMS = [
  { label: "Home", href: "/", icon: LayoutDashboard },
  { label: "Planner", href: "/planner", icon: CalendarDays },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Tracker", href: "/tracker", icon: BarChart3 },
  { label: "Library", href: "/library/hooks", icon: BookOpen },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isNavActive = (item: NavItem) => {
    if (item.href === "/" && pathname === "/") return true;
    if (item.href !== "/" && pathname.startsWith(item.href)) return true;
    if (item.subItems?.some((sub) => pathname.startsWith(sub.href))) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--canvas)] text-[var(--text-primary)]">
      {/* ==================================================================== */}
      {/* 1. DESKTOP SIDEBAR                                                   */}
      {/* ==================================================================== */}
      <aside
        className={`hidden md:flex flex-col border-r border-[var(--border-subtle)] bg-[var(--surface)] transition-all duration-300 ease-in-out sticky top-0 h-screen z-30 shrink-0 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-subtle)]">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">
                  Productivity Studio
                </span>
                <span className="text-[11px] font-medium text-[var(--text-muted)]">
                  BCP Methodology
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Perlebar Sidebar" : "Perkecil Sidebar"}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item);
            const Icon = item.icon;

            return (
              <div key={item.label} className="space-y-1">
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs border border-blue-200 dark:border-blue-900"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-5 h-5 shrink-0 ${active ? "text-blue-600 dark:text-blue-400" : ""}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                      {item.badge}
                    </span>
                  )}
                </Link>

                {/* Sub-items for expanded menu */}
                {!collapsed && item.subItems && active && (
                  <div className="pl-8 pr-2 py-1 space-y-1 border-l-2 border-blue-500/30 ml-4">
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      const SubIcon = sub.icon;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isSubActive
                              ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/30"
                              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]"
                          }`}
                        >
                          <SubIcon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer with Theme Controller */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--surface)]">
          {!collapsed ? (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium text-[var(--text-muted)] px-1">
                Tampilan Antarmuka
              </span>
              <ThemeController />
            </div>
          ) : (
            <div className="flex justify-center">
              <ThemeController compact />
            </div>
          )}
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* 2. MAIN CONTENT AREA                                                 */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        {/* Top Header */}
        <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--surface)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Brand indicator */}
            <Link href="/" className="md:hidden flex items-center gap-2 font-bold text-sm">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                PS
              </div>
              <span>Productivity Studio</span>
            </Link>
            
            {/* Desktop Breadcrumbs */}
            <div className="hidden md:flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>Studio</span>
              <span>/</span>
              <span className="font-semibold text-[var(--text-primary)] capitalize">
                {pathname === "/" ? "Overview" : pathname.replace("/", "").replace(/-/g, " ")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <ThemeController compact />
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ==================================================================== */}
      {/* 3. MOBILE FLOATING BOTTOM NAVIGATION BAR                            */}
      {/* ==================================================================== */}
      <nav
        aria-label="Navigasi Mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--surface)] border-t border-[var(--border-subtle)] z-40 px-2 flex items-center justify-around shadow-lg safe-bottom"
      >
        {MOBILE_NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
                active
                  ? "text-blue-600 dark:text-blue-400 font-bold scale-105"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
