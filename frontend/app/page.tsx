
"use client";

import { FiArrowUpRight, FiCheckCircle, FiLock } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { Box, Chip, Grid, Paper, Typography } from "@mui/material";

import { HOME_CARDS, type HomeCardConfig } from "@/config/navigation";
import { canAccessRoute, inferUserRole } from "@/lib/access-control";
import { useAppSelector } from "@/store/hooks";
import type { UserRole } from "@/types/auth";

const AUTH_STORAGE_KEY = "judwaa.auth.session";

type AuthSession = {
  role?: UserRole;
  username?: string;
  token?: string;
};

const getPersistedSession = (): { hasToken: boolean; role: UserRole } => {
  if (typeof window === "undefined") {
    return { hasToken: false, role: "user" };
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return { hasToken: false, role: "user" };
    }

    const parsed = JSON.parse(raw) as AuthSession;
    const hasToken = typeof parsed.token === "string" && parsed.token.trim().length > 0;
    return {
      hasToken,
      role: inferUserRole({ username: parsed.username, token: parsed.token, role: parsed.role }),
    };
  } catch {
    return { hasToken: false, role: "user" };
  }
};

export default function Home() {
  const router = useRouter();
  const session = useAppSelector((state) => state.auth.session);
  const persistedSession = getPersistedSession();
  const isAuthenticated = Boolean(session?.token) || persistedSession.hasToken;
  const currentRole: UserRole = session?.role ?? persistedSession.role;

  const handleCardClick = (card: HomeCardConfig) => {
    const hasAccess = canAccessRoute(
      { isAuthenticated, role: currentRole },
      { requiresAuth: card.requiresAuth, requiresRole: card.requiresRole },
    );

    if (!hasAccess && !isAuthenticated) {
      router.push(`/auth?redirect=${encodeURIComponent(card.url)}`);
      return;
    }

    if (!hasAccess) {
      router.push("/");
      return;
    }

    router.push(card.url);
  };

  return (
    <Box component="main" sx={{ minHeight: "calc(100vh - 7rem)", p: { xs: 1.5, md: 2 } }}>
      <Box sx={{ mb: 2.5, display: "grid", gap: 2.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Judwaa Workspace
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
          Open a module to continue your workflow. Protected cards automatically redirect to login when required.
        </Typography>
      </Box>

      <Grid container spacing={1.75}>
        {HOME_CARDS.map((card) => {
          const hasCardAccess = canAccessRoute(
            { isAuthenticated, role: currentRole },
            { requiresAuth: card.requiresAuth, requiresRole: card.requiresRole },
          );

          const protectedStatus = card.requiresAuth
            ? hasCardAccess
              ? "unlocked"
              : card.requiresRole && isAuthenticated
                ? "role-restricted"
                : "members"
            : "public";

          const borderColor =
            protectedStatus === "unlocked"
              ? "success.light"
              : protectedStatus === "role-restricted"
                ? "error.light"
              : protectedStatus === "members"
                ? "warning.light"
                : "divider";

          return (
            <Grid key={card.id} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
              <Paper
                component="button"
                type="button"
                onClick={() => handleCardClick(card)}
                elevation={0}
                sx={{
                  width: "100%",
                  textAlign: "left",
                  p: 2,
                  borderRadius: 2,
                  border: 1,
                  borderColor,
                  bgcolor: "background.paper",
                  cursor: "pointer",
                  transition: "box-shadow 180ms ease, border-color 180ms ease",
                  "&:hover": {
                    boxShadow: 1,
                    borderColor: "primary.light",
                  },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 1.5,
                      bgcolor: "action.hover",
                      color: "text.secondary",
                    }}
                  >
                    <card.icon size={16} />
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    {card.requiresAuth ? (
                      <Chip
                        size="small"
                        color={
                          protectedStatus === "role-restricted"
                            ? "error"
                            : isAuthenticated
                              ? "success"
                              : "warning"
                        }
                        variant="outlined"
                        icon={protectedStatus === "role-restricted" || !isAuthenticated ? <FiLock /> : <FiCheckCircle />}
                        label={
                          protectedStatus === "role-restricted"
                            ? "Admin only"
                            : isAuthenticated
                              ? "Unlocked"
                              : "Members only"
                        }
                        sx={{
                          fontWeight: 700,
                          letterSpacing: 0.3,
                        }}
                      />
                    ) : null}
                    <Box sx={{ color: "text.secondary", display: "grid", placeItems: "center" }}>
                      <FiArrowUpRight size={16} />
                    </Box>
                  </Box>
                </Box>

                <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 700 }}>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {card.content}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
