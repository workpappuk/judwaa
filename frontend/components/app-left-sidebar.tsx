"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiChevronRight, FiLock, FiX } from "react-icons/fi";
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  Typography,
} from "@mui/material";

import { SIDEBAR_ITEMS, type SidebarGroupItem, type SidebarItem } from "@/config/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setIsSidebarOpen } from "@/store/slices/uiSlice";

const AUTH_STORAGE_KEY = "judwaa.auth.session";

function isGroup(item: SidebarItem): item is SidebarGroupItem {
  return "children" in item;
}

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
  const [hasClientSession, setHasClientSession] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setHasClientSession(hasValidSession());
  }, []);

  const isAuthenticated = Boolean(authSession?.token) || hasClientSession;

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

  const goToRoute = (href: string, requiresAuth?: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      closeSidebar();
      router.push(`/auth?redirect=${encodeURIComponent(href)}`);
      return;
    }

    closeSidebar();
    router.push(href);
  };

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={closeSidebar}
      ModalProps={{ keepMounted: true }}
      slotProps={{
        paper: {
          sx: {
            top: 56,
            height: "calc(100vh - 56px)",
            width: 288,
            p: 1.5,
            borderRight: 1,
            borderColor: "divider",
          },
        },
      }}
    >
      <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Navigation</Typography>
        <IconButton size="small" onClick={closeSidebar} aria-label="Close sidebar">
          <FiX />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 1 }} />

      <List dense sx={{ py: 0 }}>
        {visibleItems.map((item) => {
          if (!isGroup(item)) {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <ListItemButton
                key={item.href}
                selected={active}
                onClick={() => goToRoute(item.href, item.requiresAuth)}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                {item.icon ? (
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <item.icon />
                  </ListItemIcon>
                ) : null}
                <Typography sx={{ fontSize: 14, fontWeight: 500, flexGrow: 1 }}>{item.label}</Typography>
                {item.requiresAuth ? <FiLock size={14} /> : null}
              </ListItemButton>
            );
          }

          const expanded = Boolean(expandedGroups[item.id]);
          const groupActive = groupsWithActiveChildren.has(item.id);

          return (
            <Box key={item.id} sx={{ border: 1, borderColor: "divider", borderRadius: 1, mb: 1, p: 0.5 }}>
              <ListItemButton selected={groupActive} onClick={() => toggleGroup(item.id)} sx={{ borderRadius: 1 }}>
                {item.icon ? (
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <item.icon />
                  </ListItemIcon>
                ) : null}
                <Typography sx={{ fontSize: 14, fontWeight: 600, flexGrow: 1 }}>{item.label}</Typography>
                {expanded ? <FiChevronDown /> : <FiChevronRight />}
              </ListItemButton>

              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <List dense sx={{ px: 0.5, pb: 0.5 }}>
                  {item.children.map((child) => {
                    const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
                    const requiresAuth = child.requiresAuth ?? item.requiresAuth;

                    return (
                      <ListItemButton
                        key={child.href}
                        selected={childActive}
                        onClick={() => goToRoute(child.href, requiresAuth)}
                        sx={{ borderRadius: 1, mb: 0.5 }}
                      >
                        {child.icon ? (
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <child.icon />
                          </ListItemIcon>
                        ) : null}
                        <Typography sx={{ fontSize: 13, fontWeight: 500, flexGrow: 1 }}>{child.label}</Typography>
                        {requiresAuth ? <FiLock size={13} /> : null}
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>
    </Drawer>
  );
}
