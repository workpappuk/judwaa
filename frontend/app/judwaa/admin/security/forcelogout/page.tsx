"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
	Alert,
	Box,
	Button,
	Paper,
	Stack,
	TextField,
	Typography,
} from "@mui/material";

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
		<Box
			component="main"
			sx={{
				position: "relative",
				minHeight: "calc(100vh - 7rem)",
				overflow: "hidden",
				borderRadius: 3,
				border: 1,
				borderColor: "divider",
				background:
					"linear-gradient(135deg, #fff5e8 0%, #fffef4 42%, #eef7ff 100%)",
				p: 2,
			}}
		>
			<Box
				sx={{
					pointerEvents: "none",
					position: "absolute",
					left: -48,
					top: 32,
					height: 176,
					width: 176,
					borderRadius: "9999px",
					bgcolor: "warning.light",
					opacity: 0.22,
					filter: "blur(32px)",
				}}
			/>
			<Box
				sx={{
					pointerEvents: "none",
					position: "absolute",
					right: -40,
					bottom: 24,
					height: 224,
					width: 224,
					borderRadius: "9999px",
					bgcolor: "info.light",
					opacity: 0.2,
					filter: "blur(32px)",
				}}
			/>

			<Box sx={{ position: "relative", mx: "auto", maxWidth: 960, py: { xs: 2, md: 4 } }}>
				<Paper
					variant="outlined"
					sx={{
						p: { xs: 2.5, sm: 3 },
						borderRadius: 3,
						backdropFilter: "blur(4px)",
						bgcolor: "rgba(255, 255, 255, 0.85)",
					}}
				>
					<Stack spacing={2.5}>
						<Typography
							variant="caption"
							sx={{ textTransform: "uppercase", letterSpacing: "0.24em", fontWeight: 700, color: "text.secondary" }}
						>
							Admin Security
						</Typography>

						<Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
							Force Logout Tokens
						</Typography>

						<Typography variant="body2" color="text.secondary">
							This action blacklists a JWT immediately. Use it to force logout compromised or leaked sessions.
						</Typography>

						{!session?.token ? (
							<Alert severity="warning">
								You are not logged in. Please{" "}
								<Link href="/auth" style={{ fontWeight: 600, textDecoration: "underline" }}>
									login
								</Link>{" "}
								with an admin account.
							</Alert>
						) : null}

						<Box component="form" onSubmit={handleForceLogoutSubmit} sx={{ display: "grid", gap: 2 }}>
							<TextField
								label="Token To Revoke"
								placeholder="Paste JWT or Bearer token"
								multiline
								minRows={5}
								value={tokenToRevoke}
								onChange={(event) => setTokenToRevoke(event.target.value)}
								fullWidth
							/>

							{error ? <Alert severity="error">{error}</Alert> : null}
							{success ? <Alert severity="success">{success}</Alert> : null}

							<Button type="submit" variant="contained" color="warning" disabled={isLoading} sx={{ minHeight: 40 }}>
								{isLoading ? "Revoking token..." : "Force logout token"}
							</Button>
						</Box>
					</Stack>
				</Paper>
			</Box>
		</Box>
	);
}
