
"use client";

import { FiArrowUpRight, FiCheckCircle, FiLock } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { Box, Chip, Grid, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { HOME_CARDS, type HomeCardConfig } from "@/config/navigation";
import { useAppSelector } from "@/store/hooks";

const AUTH_STORAGE_KEY = "judwaa.auth.session";

type AuthSession = {
  username?: string;
  token?: string;
};

const hasValidSession = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return false;
    }

    const parsed = JSON.parse(raw) as AuthSession;
    return typeof parsed.token === "string" && parsed.token.trim().length > 0;
  } catch {
    return false;
  }
};

export default function Home() {
  const router = useRouter();
  const session = useAppSelector((state) => state.auth.session);
  const [hasClientSession, setHasClientSession] = useState(false);

  useEffect(() => {
    setHasClientSession(hasValidSession());
  }, []);

  const isAuthenticated = Boolean(session?.token) || hasClientSession;

  const handleCardClick = (card: HomeCardConfig) => {
    if (card.requiresAuth && !isAuthenticated) {
      router.push("/auth");
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
          const protectedStatus = card.requiresAuth ? (isAuthenticated ? "unlocked" : "members") : "public";
          const borderColor =
            protectedStatus === "unlocked"
              ? "success.light"
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
                        color={isAuthenticated ? "success" : "warning"}
                        variant="outlined"
                        icon={isAuthenticated ? <FiCheckCircle /> : <FiLock />}
                        label={isAuthenticated ? "Unlocked" : "Members only"}
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
