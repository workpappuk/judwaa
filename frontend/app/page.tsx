
"use client";

import type { IconType } from "react-icons";
import { FiArrowUpRight, FiBookOpen, FiCheckCircle, FiDatabase, FiLock, FiLogOut, FiShield, FiTrendingUp, FiUserCheck } from "react-icons/fi";
import { useRouter } from "next/navigation";
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
  const isAuthenticated = Boolean(session?.token) || hasValidSession();

  type Card = {
    id: number;
    title: string;
    content: string;
    url: string;
    icon: IconType;
    requiresAuth?: boolean;
  };

  const cards: Card[] = [
    { id: 1, title: "F&O", content: "Live market dashboard", url: "/trading/f&o", icon: FiTrendingUp, requiresAuth: true },
    { id: 2, title: "Instruments", content: "List of all instruments", url: "/trading/instrument", icon: FiBookOpen, requiresAuth: true },
    { id: 3, title: "Auth", content: "Login and registration", url: "/auth", icon: FiUserCheck },
    { id: 4, title: "Admin", content: "Admin dashboard", url: "/judwaa/admin", icon: FiShield, requiresAuth: true },
    { id: 5, title: "Incentive", content: "Scheme and rule manager", url: "/incentive", icon: FiLogOut, requiresAuth: true },
    { id: 6, title: "Data Collector", content: "Step-based ingestion setup", url: "/data-collector", icon: FiDatabase, requiresAuth: true },
  ];

  const handleCardClick = (card: Card) => {
    if (card.requiresAuth && !isAuthenticated) {
      router.push("/auth");
      return;
    }

    router.push(card.url);
  };

  return (
    <main className="min-h-[calc(100vh-7rem)] bg-[#f5f7fb] dark:bg-[#0b0f15] text-zinc-900 dark:text-zinc-100 transition-colors rounded-xl p-3">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => handleCardClick(card)}
            className={`block w-full text-left bg-white dark:bg-zinc-900 border p-4 rounded shadow-sm hover:shadow-md transition ${
              card.requiresAuth
                ? isAuthenticated
                  ? "border-emerald-300/80 dark:border-emerald-800/80"
                  : "border-amber-300/80 dark:border-amber-800/80"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
                <card.icon className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5">
                {card.requiresAuth ? (
                  isAuthenticated ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/90 dark:border-emerald-700/90 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700 dark:text-emerald-300">
                      <FiCheckCircle className="h-3 w-3" />
                      Unlocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/90 dark:border-amber-700/90 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700 dark:text-amber-300">
                      <FiLock className="h-3 w-3" />
                      Members only
                    </span>
                  )
                ) : null}
                <FiArrowUpRight className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              </div>
            </div>
            <h2 className="display-face text-xl font-semibold mt-3">{card.title}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{card.content}</p>
          </button>
        ))}
      </div>
    </main>
  );
}
