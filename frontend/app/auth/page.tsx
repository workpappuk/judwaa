"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Tabs from "@/components/tab";
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
      dispatch(setSession({ username, token: response.token }));
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

      dispatch(setSession({ username, token: response.token }));
      setRegisterSuccess("Registration successful. You are now signed in.");
    } catch (error) {
      setRegisterError(getErrorMessage(error, "Registration failed."));
    } finally {
      setIsRegisterLoading(false);
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-7rem)] overflow-hidden rounded-2xl border border-zinc-200 bg-[linear-gradient(135deg,#f7f4ea_0%,#eef6ff_45%,#f4fff5_100%)] p-4 dark:border-zinc-800 dark:bg-[linear-gradient(135deg,#131a23_0%,#0e1a17_50%,#1c1823_100%)]">
      <div className="pointer-events-none absolute -left-14 top-8 h-40 w-40 rounded-full bg-amber-300/35 blur-2xl dark:bg-amber-400/10" />
      <div className="pointer-events-none absolute -right-10 bottom-6 h-52 w-52 rounded-full bg-sky-300/35 blur-2xl dark:bg-sky-400/10" />

      <div className="relative mx-auto grid max-w-5xl items-start gap-8 py-6 lg:grid-cols-[1.05fr_1fr] lg:py-10">
        <section className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-600 dark:text-zinc-400">
            Account Access
          </p>
          <h1 className="display-face text-4xl leading-none text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Login Fast, Trade Faster
          </h1>
          
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white/85 p-5 shadow-lg shadow-zinc-300/40 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/75 dark:shadow-black/30 sm:p-6">
          <Tabs
            defaultTab="login"
            className="w-full"
            tabs={[
              {
                id: "login",
                label: "Login",
                content: (
                  <form className="space-y-4" onSubmit={handleLoginSubmit}>
                    <label className="block space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        Username
                      </span>
                      <input
                        value={loginUsername}
                        onChange={(event) => setLoginUsername(event.target.value)}
                        autoComplete="username"
                        className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        placeholder="Enter your username"
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        Password
                      </span>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        autoComplete="current-password"
                        className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        placeholder="Enter your password"
                      />
                    </label>

                    {loginError ? (
                      <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200">
                        {loginError}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={isLoginLoading}
                      className="h-10 w-full rounded-lg bg-zinc-900 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      {isLoginLoading ? "Signing in..." : "Sign in"}
                    </button>
                  </form>
                ),
              },
              {
                id: "register",
                label: "Register",
                content: (
                  <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                    <label className="block space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        Username
                      </span>
                      <input
                        value={registerUsername}
                        onChange={(event) => setRegisterUsername(event.target.value)}
                        autoComplete="username"
                        className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        placeholder="Choose a username"
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        Password
                      </span>
                      <input
                        type="password"
                        value={registerPassword}
                        onChange={(event) => setRegisterPassword(event.target.value)}
                        autoComplete="new-password"
                        className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        placeholder="Create a password"
                      />
                    </label>

                    {registerError ? (
                      <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200">
                        {registerError}
                      </p>
                    ) : null}

                    {registerSuccess ? (
                      <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
                        {registerSuccess}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={isRegisterLoading}
                      className="h-10 w-full rounded-lg bg-emerald-700 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
                    >
                      {isRegisterLoading ? "Creating account..." : "Create account"}
                    </button>
                  </form>
                ),
              },
            ]}
          />
        </section>
      </div>
    </main>
  );
}