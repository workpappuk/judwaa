"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiChevronRight, FiLock, FiX } from "react-icons/fi";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { canAccessRoute, hasRequiredRole, inferUserRole } from "@/lib/access-control";
import { SIDEBAR_ITEMS, type SidebarGroupItem, type SidebarItem } from "@/config/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setIsSidebarOpen, setIsSidebarPinned } from "@/store/slices/uiSlice";
import type { UserRole } from "@/types/auth";

const AUTH_STORAGE_KEY = "judwaa.auth.session";
const NAVBAR_HEIGHT = 56;
const SIDEBAR_WIDTH = 296;

function isGroup(item: SidebarItem): item is SidebarGroupItem {
  return "children" in item;
}

function parsePersistedSession(raw: string | null): { hasToken: boolean; role: UserRole } {
  try {
    if (!raw) {
      return { hasToken: false, role: "user" };
    }

    const parsed = JSON.parse(raw) as { token?: string; username?: string; role?: string };
    const hasToken = typeof parsed.token === "string" && parsed.token.trim().length > 0;
    return {
      hasToken,
      role: inferUserRole({ username: parsed.username, token: parsed.token, role: parsed.role }),
    };
  } catch {
    return { hasToken: false, role: "user" };
  }
}

export function AppLeftSidebar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isOpen = useAppSelector((state) => state.ui.isSidebarOpen);
  const isPinned = useAppSelector((state) => state.ui.isSidebarPinned);
  const authSession = useAppSelector((state) => state.auth.session);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [persistedAuth, setPersistedAuth] = useState<{ hasToken: boolean; role: UserRole }>({ hasToken: false, role: "user" });
  const isAuthenticated = Boolean(authSession?.token) || persistedAuth.hasToken;
  const currentRole: UserRole = authSession?.role ?? persistedAuth.role;

  const visibleItems = useMemo<SidebarItem[]>(() => {
    const shouldShowLeaf = (item: { requiresRole?: UserRole | UserRole[] }) => {
      if (!isAuthenticated) {
        return true;
      }

      return hasRequiredRole(currentRole, item.requiresRole);
    };

    return SIDEBAR_ITEMS.reduce<SidebarItem[]>((accumulator, item) => {
      if (!isGroup(item)) {
        if (shouldShowLeaf(item)) {
          accumulator.push(item);
        }

        return accumulator;
      }

      const visibleChildren = item.children.filter((child) => shouldShowLeaf({ requiresRole: child.requiresRole ?? item.requiresRole }));
      if (visibleChildren.length === 0) {
        return accumulator;
      }

      accumulator.push({ ...item, children: visibleChildren });
      return accumulator;
    }, []);
  }, [currentRole, isAuthenticated]);

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
    const refreshPersistedSession = () => {
      setPersistedAuth(parsePersistedSession(window.localStorage.getItem(AUTH_STORAGE_KEY)));
    };

    refreshPersistedSession();
    window.addEventListener("storage", refreshPersistedSession);

    return () => {
      window.removeEventListener("storage", refreshPersistedSession);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop && isPinned) {
      dispatch(setIsSidebarPinned(false));
    }

    if (isDesktop && isPinned && !isOpen) {
      dispatch(setIsSidebarOpen(true));
    }
  }, [dispatch, isDesktop, isOpen, isPinned]);

  useEffect(() => {
    if (!isDesktop && isOpen) {
      dispatch(setIsSidebarOpen(false));
    }
  }, [dispatch, isDesktop, isOpen, pathname]);

  const closeSidebar = () => {
    if (isDesktop && isPinned) {
      return;
    }

    dispatch(setIsSidebarOpen(false));
  };

  const togglePin = () => {
    const nextPinned = !isPinned;
    dispatch(setIsSidebarPinned(nextPinned));
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((previous) => ({ ...previous, [groupId]: !previous[groupId] }));
  };

  const goToRoute = (href: string, requiresAuth?: boolean, requiresRole?: UserRole | UserRole[]) => {
    const hasAccess = canAccessRoute(
      { isAuthenticated, role: currentRole },
      { requiresAuth, requiresRole },
    );

    if (!hasAccess && !isAuthenticated) {
      closeSidebar();
      router.push(`/auth?redirect=${encodeURIComponent(href)}`);
      return;
    }

    if (!hasAccess) {
      closeSidebar();
      router.push("/");
      return;
    }

    closeSidebar();
    router.push(href);
  };

  const itemButtonSx = {
    borderRadius: 1.5,
    mb: 0.5,
    "&.Mui-selected": {
      bgcolor: "action.selected",
      "&:hover": {
        bgcolor: "action.selected",
      },
    },
  };

  return (
    <Drawer
      anchor="left"
      variant={isDesktop ? "persistent" : "temporary"}
      open={isDesktop ? isPinned || isOpen : isOpen}
      onClose={closeSidebar}
      ModalProps={isDesktop ? undefined : { keepMounted: true }}
      slotProps={{
        paper: {
          sx: {
            top: NAVBAR_HEIGHT,
            height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            width: isDesktop ? SIDEBAR_WIDTH : { xs: 280, sm: SIDEBAR_WIDTH },
            p: 1.5,
            bgcolor: "background.paper",
          },
        },
      }}
    >
      <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Navigation</Typography>
          <Typography variant="caption" color="text.secondary">Choose a workspace module</Typography>
        </Box>
        {!isDesktop ? (
          <IconButton size="small" onClick={closeSidebar} aria-label="Close sidebar">
            <FiX />
          </IconButton>
        ) : (
          <IconButton
            size="small"
            onClick={togglePin}
            aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
            title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
          >
            {isPinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
          </IconButton>
        )}
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
                onClick={() => goToRoute(item.href, item.requiresAuth, item.requiresRole)}
                sx={itemButtonSx}
              >
                {item.icon ? (
                  <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
                    <item.icon />
                  </ListItemIcon>
                ) : null}
                <Typography sx={{ fontSize: 14, fontWeight: 500, flexGrow: 1 }}>{item.label}</Typography>
                {item.requiresAuth || item.requiresRole ? <FiLock size={14} style={{ opacity: 0.7 }} /> : null}
              </ListItemButton>
            );
          }

          const expanded = Boolean(expandedGroups[item.id]) || groupsWithActiveChildren.has(item.id);
          const groupActive = groupsWithActiveChildren.has(item.id);

          return (
            <Box
              key={item.id}
              sx={{
                borderRadius: 1.5,
                mb: 1,
                p: 0.5,
                bgcolor: groupActive ? "action.selected" : "action.hover",
              }}
            >
              <ListItemButton
                selected={groupActive}
                onClick={() => toggleGroup(item.id)}
                aria-expanded={expanded}
                sx={{ ...itemButtonSx, mb: 0 }}
              >
                {item.icon ? (
                  <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
                    <item.icon />
                  </ListItemIcon>
                ) : null}
                <Typography sx={{ fontSize: 14, fontWeight: 600, flexGrow: 1 }}>{item.label}</Typography>
                {expanded ? <FiChevronDown /> : <FiChevronRight />}
              </ListItemButton>

              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <List dense sx={{ ml: 1.6, mt: 0.5, pl: 0.6, pb: 0.5, borderLeft: 1, borderColor: "divider" }}>
                  {item.children.map((child) => {
                    const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
                    const requiresAuth = child.requiresAuth ?? item.requiresAuth;
                    const requiresRole = child.requiresRole ?? item.requiresRole;

                    return (
                      <ListItemButton
                        key={child.href}
                        selected={childActive}
                        onClick={() => goToRoute(child.href, requiresAuth, requiresRole)}
                        sx={itemButtonSx}
                      >
                        {child.icon ? (
                          <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
                            <child.icon />
                          </ListItemIcon>
                        ) : null}
                        <Typography sx={{ fontSize: 13, fontWeight: 500, flexGrow: 1 }}>{child.label}</Typography>
                        {requiresAuth || requiresRole ? <FiLock size={13} style={{ opacity: 0.7 }} /> : null}
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
