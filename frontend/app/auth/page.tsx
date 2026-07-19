"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Chip, Container, Paper, TextField, Typography } from "@mui/material";
import { FiLogIn, FiUserPlus } from "react-icons/fi";

import Tabs from "@/components/tab";
import { inferUserRole } from "@/lib/access-control";
import { loginUser, registerUser } from "@/services/auth-api";
import { useAppDispatch } from "@/store/hooks";
import { setSession } from "@/store/slices/authSlice";

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
}

export default function AuthPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);

    const username = loginUsername.trim();
    if (!username || !loginPassword) {
      setLoginError("Username and password are required.");
      return;
    }

    setIsLoginLoading(true);
    try {
      const response = await loginUser({ username, password: loginPassword });
      dispatch(
        setSession({
          username,
          token: response.token,
          role: inferUserRole({ username, token: response.token, role: response.role }),
        }),
      );
      setRegisterSuccess(null);
      router.push("/");
    } catch (error) {
      setLoginError(getErrorMessage(error, "Login failed."));
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegisterError(null);
    setRegisterSuccess(null);

    const username = registerUsername.trim();
    if (!username || !registerPassword) {
      setRegisterError("Username and password are required.");
      return;
    }

    setIsRegisterLoading(true);
    try {
      await registerUser({ username, password: registerPassword });
      const response = await loginUser({ username, password: registerPassword });

      dispatch(
        setSession({
          username,
          token: response.token,
          role: inferUserRole({ username, token: response.token, role: response.role }),
        }),
      );
      setRegisterSuccess("Registration successful. You are now signed in.");
    } catch (error) {
      setRegisterError(getErrorMessage(error, "Registration failed."));
    } finally {
      setIsRegisterLoading(false);
    }
  };

  return (
    <Box component="main" sx={{ minHeight: "calc(100vh - 7rem)", display: "grid", alignItems: "center", py: { xs: 2, md: 4 } }}>
      <Container maxWidth="sm">
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 3,
          }}
        >
          <Box sx={{ mb: 2.5 }}>
            <Chip size="small" label="Account Access" sx={{ mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue, or create an account in seconds.
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "background.default" }}>
            <Tabs
              defaultTab="login"
              tabs={[
                {
                  id: "login",
                  label: "Login",
                  content: (
                    <Box component="form" onSubmit={handleLoginSubmit} sx={{ display: "grid", gap: 2 }}>
                      <TextField
                        label="Username"
                        value={loginUsername}
                        onChange={(event) => setLoginUsername(event.target.value)}
                        autoComplete="username"
                        placeholder="Enter your username"
                        size="small"
                        fullWidth
                        autoFocus
                      />

                      <TextField
                        type="password"
                        label="Password"
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        size="small"
                        fullWidth
                      />

                      {loginError ? <Alert severity="error">{loginError}</Alert> : null}

                      <Button type="submit" disabled={isLoginLoading} variant="contained" size="medium" startIcon={<FiLogIn />}>
                        {isLoginLoading ? "Signing in..." : "Sign in"}
                      </Button>
                    </Box>
                  ),
                },
                {
                  id: "register",
                  label: "Register",
                  content: (
                    <Box component="form" onSubmit={handleRegisterSubmit} sx={{ display: "grid", gap: 2 }}>
                      <TextField
                        label="Username"
                        value={registerUsername}
                        onChange={(event) => setRegisterUsername(event.target.value)}
                        autoComplete="username"
                        placeholder="Choose a username"
                        size="small"
                        fullWidth
                      />

                      <TextField
                        type="password"
                        label="Password"
                        value={registerPassword}
                        onChange={(event) => setRegisterPassword(event.target.value)}
                        autoComplete="new-password"
                        placeholder="Create a password"
                        size="small"
                        fullWidth
                      />

                      {registerError ? <Alert severity="error">{registerError}</Alert> : null}
                      {registerSuccess ? <Alert severity="success">{registerSuccess}</Alert> : null}

                      <Button
                        type="submit"
                        disabled={isRegisterLoading}
                        variant="contained"
                        color="success"
                        size="medium"
                        startIcon={<FiUserPlus />}
                      >
                        {isRegisterLoading ? "Creating account..." : "Create account"}
                      </Button>
                    </Box>
                  ),
                },
              ]}
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}