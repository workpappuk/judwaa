"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { forceLogoutToken } from "@/services/auth-api";
import { useAppSelector } from "@/store/hooks";

function getErrorMessage(error: unknown, fallbackMessage: string): string {
	if (error instanceof Error && error.message.trim().length > 0) {
		return error.message;
	}

	return fallbackMessage;
}

export default function AdminPage() {
	const session = useAppSelector((state) => state.auth.session);
	const [tokenToRevoke, setTokenToRevoke] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handleForceLogoutSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setSuccess(null);

		if (!session?.token) {
			setError("Login as admin first to use force logout.");
			return;
		}

		const normalizedToken = tokenToRevoke.trim();
		if (!normalizedToken) {
			setError("Token to revoke is required.");
			return;
		}

		setIsLoading(true);
		try {
			const responseMessage = await forceLogoutToken(session.token, normalizedToken);
			setSuccess(responseMessage || "Token forcefully logged out successfully.");
			setTokenToRevoke("");
		} catch (apiError) {
			setError(getErrorMessage(apiError, "Force logout failed."));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<main className="relative min-h-[calc(100vh-7rem)] overflow-hidden rounded-2xl border border-zinc-200 bg-[linear-gradient(135deg,#fff5e8_0%,#fffef4_42%,#eef7ff_100%)] p-4 dark:border-zinc-800 dark:bg-[linear-gradient(135deg,#1c1522_0%,#22180f_48%,#13202b_100%)]">
			<div className="pointer-events-none absolute -left-12 top-8 h-44 w-44 rounded-full bg-amber-300/35 blur-2xl dark:bg-amber-500/10" />
			<div className="pointer-events-none absolute -right-10 bottom-6 h-56 w-56 rounded-full bg-cyan-300/35 blur-2xl dark:bg-cyan-500/10" />

			<div className="relative mx-auto max-w-3xl py-6 lg:py-10">
				<section className="space-y-5 rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-lg shadow-zinc-300/30 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/75 dark:shadow-black/30 sm:p-6">
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-600 dark:text-zinc-400">
						Admin Security
					</p>
					<h1 className="display-face text-4xl leading-none text-zinc-900 dark:text-zinc-50 sm:text-5xl">
						Force Logout Tokens
					</h1>

					<p className="text-sm text-zinc-700 dark:text-zinc-300">
						This action blacklists a JWT immediately. Use it to force logout compromised or leaked sessions.
					</p>

					{!session?.token ? (
						<p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200">
							You are not logged in. Please <Link href="/auth" className="font-semibold underline underline-offset-2">login</Link> with an admin account.
						</p>
					) : null}

					<form className="space-y-4" onSubmit={handleForceLogoutSubmit}>
						<label className="block space-y-1">
							<span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
								Token To Revoke
							</span>
							<textarea
								value={tokenToRevoke}
								onChange={(event) => setTokenToRevoke(event.target.value)}
								className="min-h-28 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
								placeholder="Paste JWT or Bearer token"
							/>
						</label>

						{error ? (
							<p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200">
								{error}
							</p>
						) : null}

						{success ? (
							<p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
								{success}
							</p>
						) : null}

						<button
							type="submit"
							disabled={isLoading}
							className="h-10 w-full rounded-lg bg-amber-700 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-500 dark:text-zinc-950 dark:hover:bg-amber-400"
						>
							{isLoading ? "Revoking token..." : "Force logout token"}
						</button>
					</form>
				</section>
			</div>
		</main>
	);
}
