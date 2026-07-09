"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiBookOpen, FiChevronDown, FiChevronRight, FiDatabase, FiHome, FiLock, FiLogOut, FiMap, FiShield, FiTrendingUp, FiUserCheck, FiUsers, FiX } from "react-icons/fi";
import type { IconType } from "react-icons";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setIsSidebarOpen } from "@/store/slices/uiSlice";

const AUTH_STORAGE_KEY = "judwaa.auth.session";

type SidebarLeafItem = {
  href: string;
  label: string;
  icon?: IconType;
  requiresAuth?: boolean;
};

type SidebarGroupItem = {
  id: string;
  label: string;
  icon?: IconType;
  requiresAuth?: boolean;
  children: SidebarLeafItem[];
};

type SidebarItem = SidebarLeafItem | SidebarGroupItem;

function isGroup(item: SidebarItem): item is SidebarGroupItem {
  return "children" in item;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { href: "/", label: "Home", icon: FiHome },
  {
    id: "trading",
    label: "Trading",
    icon: FiTrendingUp,
    requiresAuth: true,
    children: [
      { href: "/trading/f&o", label: "F&O", icon: FiTrendingUp, requiresAuth: true },
      { href: "/trading/instrument", label: "Instruments", icon: FiBookOpen, requiresAuth: true },
      { href: "/trading/calculator/stoploss", label: "Stoploss Calculator", icon: FiTrendingUp, requiresAuth: false },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    icon: FiShield,
    children: [
      { href: "/auth", label: "Auth", icon: FiUserCheck },
      { href: "/judwaa/admin", label: "Admin", icon: FiShield, requiresAuth: true },
      { href: "/incentive", label: "Incentive", icon: FiLogOut, requiresAuth: true },
      { href: "/data-collector", label: "Data Collector", icon: FiDatabase, requiresAuth: true },
    ],
  },
  {
    id: "lms",
    label: "LMS",
    icon: FiUsers,
    requiresAuth: true,
    children: [
      { href: "/lms", label: "Route Hub", icon: FiUsers, requiresAuth: true },
      { href: "/lms/organization-management", label: "Organization", icon: FiUsers, requiresAuth: true },
      { href: "/lms/school-management", label: "School", icon: FiBookOpen, requiresAuth: true },
      { href: "/lms/school-routes", label: "School Routes", icon: FiMap, requiresAuth: true },
    ],
  },
];

function hasValidSession(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return false;
    }

    const parsed = JSON.parse(raw) as { token?: string };
    return typeof parsed.token === "string" && parsed.token.trim().length > 0;
  } catch {
    return false;
  }
}

export function AppLeftSidebar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const isOpen = useAppSelector((state) => state.ui.isSidebarOpen);
  const authSession = useAppSelector((state) => state.auth.session);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const isAuthenticated = Boolean(authSession?.token) || hasValidSession();

  const visibleItems = useMemo(() => SIDEBAR_ITEMS, []);

  const groupsWithActiveChildren = useMemo(() => {
    const activeGroupIds = new Set<string>();
    for (const item of visibleItems) {
      if (isGroup(item) && item.children.some((child) => pathname === child.href || pathname.startsWith(`${child.href}/`))) {
        activeGroupIds.add(item.id);
      }
    }
    return activeGroupIds;
  }, [pathname, visibleItems]);

  useEffect(() => {
    setExpandedGroups((previous) => {
      const next = { ...previous };
      for (const groupId of groupsWithActiveChildren) {
        next[groupId] = true;
      }
      return next;
    });
  }, [groupsWithActiveChildren]);

  const closeSidebar = () => {
    dispatch(setIsSidebarOpen(false));
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((previous) => ({ ...previous, [groupId]: !previous[groupId] }));
  };

  const handleProtectedRouteClick = (event: React.MouseEvent, href: string, requiresAuth?: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      event.preventDefault();
      closeSidebar();
      router.push(`/auth?redirect=${encodeURIComponent(href)}`);
      return;
    }

    closeSidebar();
  };

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close navigation sidebar"
          onClick={closeSidebar}
          className="fixed inset-0 z-30 bg-black/35"
        />
      ) : null}

      <aside
        className={`fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-72 border-r border-zinc-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm transition-transform dark:border-zinc-800 dark:bg-[#0f141c]/95 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display-face text-xl font-semibold text-zinc-900 dark:text-zinc-100">Navigation</h2>
          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close sidebar"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-2">
          {visibleItems.map((item) => {
            if (!isGroup(item)) {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(event) => handleProtectedRouteClick(event, item.href, item.requiresAuth)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  {item.icon ? <item.icon className="h-4 w-4" /> : null}
                  {item.label}
                  {item.requiresAuth ? <FiLock className="ml-auto h-3.5 w-3.5 opacity-75" /> : null}
                </Link>
              );
            }

            const expanded = Boolean(expandedGroups[item.id]);
            const groupActive = groupsWithActiveChildren.has(item.id);

            return (
              <div key={item.id} className="rounded-lg border border-zinc-200/70 p-1 dark:border-zinc-800/70">
                <button
                  type="button"
                  onClick={() => toggleGroup(item.id)}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-semibold transition ${
                    groupActive
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {item.icon ? <item.icon className="h-4 w-4" /> : null}
                    {item.label}
                  </span>
                  {expanded ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
                </button>

                {expanded ? (
                  <div className="mt-1 space-y-1 px-1 pb-1">
                    {item.children.map((child) => {
                      const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`);

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={(event) => handleProtectedRouteClick(event, child.href, child.requiresAuth || item.requiresAuth)}
                          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition ${
                            childActive
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                              : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {child.icon ? <child.icon className="h-4 w-4" /> : null}
                          {child.label}
                          {(child.requiresAuth || item.requiresAuth) ? (
                            <FiLock className="ml-auto h-3.5 w-3.5 opacity-75" />
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
