"use client";

import { useState } from "react";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Container,
	Divider,
	TextField,
	Typography,
} from "@mui/material";
import { FiAlertTriangle, FiPercent, FiTrendingDown, FiTrendingUp } from "react-icons/fi";

const formatMoney = (value: number): string =>
	new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 2,
	}).format(value);

const formatNumber = (value: number): string =>
	new Intl.NumberFormat("en-IN", {
		maximumFractionDigits: 2,
	}).format(value);

const toNumber = (value: string): number => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
};

const DEFAULT_STOPLOSS_FORM = {
	positionType: "SELLER" as const,
	lotSize: "1",
	pricePerLot: "30",
	amountRequiredPerLot: "250000",
	capital: "2500000",
	profitLossPct: "2.2",
	stoplossPct: "1",
};

export default function FnOStoplossCalculatorPage() {
	const [positionType, setPositionType] = useState<"BUYER" | "SELLER">(DEFAULT_STOPLOSS_FORM.positionType);
	const [lotSize, setLotSize] = useState(DEFAULT_STOPLOSS_FORM.lotSize);
	const [pricePerLot, setPricePerLot] = useState(DEFAULT_STOPLOSS_FORM.pricePerLot);
	const [amountRequiredPerLot, setAmountRequiredPerLot] = useState(DEFAULT_STOPLOSS_FORM.amountRequiredPerLot);
	const [capital, setCapital] = useState(DEFAULT_STOPLOSS_FORM.capital);
	const [profitLossPct, setProfitLossPct] = useState(DEFAULT_STOPLOSS_FORM.profitLossPct);
	const [stoplossPct, setStoplossPct] = useState(DEFAULT_STOPLOSS_FORM.stoplossPct);

	const resetDefaults = () => {
		setPositionType(DEFAULT_STOPLOSS_FORM.positionType);
		setLotSize(DEFAULT_STOPLOSS_FORM.lotSize);
		setPricePerLot(DEFAULT_STOPLOSS_FORM.pricePerLot);
		setAmountRequiredPerLot(DEFAULT_STOPLOSS_FORM.amountRequiredPerLot);
		setCapital(DEFAULT_STOPLOSS_FORM.capital);
		setProfitLossPct(DEFAULT_STOPLOSS_FORM.profitLossPct);
		setStoplossPct(DEFAULT_STOPLOSS_FORM.stoplossPct);
	};

	const calculations = (() => {
		const lotSizeValue = Math.max(0, toNumber(lotSize));
		const pricePerLotValue = Math.max(0, toNumber(pricePerLot));
		const amountRequiredPerLotValue = Math.max(0, toNumber(amountRequiredPerLot));
		const capitalValue = Math.max(0, toNumber(capital));
		const profitLossPctValue = Math.abs(toNumber(profitLossPct));
		const stoplossPctValue = Math.max(0, Math.abs(toNumber(stoplossPct)));
		const quantityValue = amountRequiredPerLotValue > 0 ? Math.floor(capitalValue / amountRequiredPerLotValue) : 0;

		const totalUnits = lotSizeValue * quantityValue;
		const investedAmount = quantityValue * amountRequiredPerLotValue;
		const premiumNotional = totalUnits * pricePerLotValue;
		const sideFactor = positionType === "BUYER" ? 1 : -1;

		const expectedExitPrice =
			positionType === "BUYER"
				? pricePerLotValue * (1 + profitLossPctValue / 100)
				: pricePerLotValue * (1 - profitLossPctValue / 100);
		const stoplossPrice =
			positionType === "BUYER"
				? pricePerLotValue * (1 - stoplossPctValue / 100)
				: pricePerLotValue * (1 + stoplossPctValue / 100);

		const targetExitAmountPerLot =
			positionType === "BUYER"
				? amountRequiredPerLotValue * (1 + profitLossPctValue / 100)
				: amountRequiredPerLotValue * (1 - profitLossPctValue / 100);
		const stoplossExitAmountPerLot =
			positionType === "BUYER"
				? amountRequiredPerLotValue * (1 - stoplossPctValue / 100)
				: amountRequiredPerLotValue * (1 + stoplossPctValue / 100);
		const targetExitTotalAmount = targetExitAmountPerLot * quantityValue;
		const stoplossExitTotalAmount = stoplossExitAmountPerLot * quantityValue;

		const expectedPnL = (expectedExitPrice - pricePerLotValue) * totalUnits * sideFactor;
		const stoplossPnL = (stoplossPrice - pricePerLotValue) * totalUnits * sideFactor;
		const maxLoss = Math.max(0, -stoplossPnL);
		const targetProfitPctOnInvested = profitLossPctValue;
		const stoplossPctOnInvested = stoplossPctValue;
		const targetProfitAmountOnInvested = investedAmount * (targetProfitPctOnInvested / 100);
		const maxLossAmountOnInvested = investedAmount * (stoplossPctOnInvested / 100);
		const riskRewardRatio = maxLossAmountOnInvested > 0 ? targetProfitAmountOnInvested / maxLossAmountOnInvested : 0;
		const expectedTurnover = investedAmount + targetExitTotalAmount;
		const stoplossTurnover = investedAmount + stoplossExitTotalAmount;
		const investedBasedTargetPnL = (targetExitTotalAmount - investedAmount) * sideFactor;
		const investedBasedStoplossPnL = (stoplossExitTotalAmount - investedAmount) * sideFactor;
		const expectedPnLOnTurnoverPct = expectedTurnover > 0 ? (investedBasedTargetPnL / expectedTurnover) * 100 : 0;
		const maxLossOnTurnoverPct = stoplossTurnover > 0 ? (Math.max(0, -investedBasedStoplossPnL) / stoplossTurnover) * 100 : 0;
		const maxAffordableQuantity = quantityValue;
		const remainingCapital = capitalValue - investedAmount;
		const capitalUsagePct = capitalValue > 0 ? (investedAmount / capitalValue) * 100 : 0;

		return {
			lotSizeValue,
			quantityValue,
			pricePerLotValue,
			amountRequiredPerLotValue,
			profitLossPctValue,
			stoplossPctValue,
			premiumNotional,
			totalUnits,
			investedAmount,
			capitalValue,
			maxAffordableQuantity,
			remainingCapital,
			capitalUsagePct,
			expectedExitPrice,
			stoplossPrice,
			targetExitAmountPerLot,
			stoplossExitAmountPerLot,
			expectedPnL,
			maxLoss,
			riskRewardRatio,
			targetProfitAmountOnInvested,
			maxLossAmountOnInvested,
			targetProfitPctOnInvested,
			stoplossPctOnInvested,
			expectedTurnover,
			stoplossTurnover,
			expectedPnLOnTurnoverPct,
			maxLossOnTurnoverPct,
			stoplossTooHigh: stoplossPctValue >= 100,
			hasInput: lotSizeValue > 0 && quantityValue > 0 && pricePerLotValue > 0 && amountRequiredPerLotValue > 0,
			overCapital: capitalValue > 0 && investedAmount > capitalValue,
		};
	})();

	const metricCard = (label: string, value: string, subtext?: string, valueColor?: string) => (
		<Card variant="outlined" sx={{ height: "100%" }}>
			<CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
				<Typography variant="caption" color="text.secondary">{label}</Typography>
				<Typography variant="body2" sx={{ fontWeight: 700, color: valueColor ?? "text.primary" }}>{value}</Typography>
				{subtext ? (
					<Typography variant="caption" color="text.secondary">{subtext}</Typography>
				) : null}
			</CardContent>
		</Card>
	);

	return (
		<Container maxWidth="lg" sx={{ py: 3 }}>
			<Card variant="outlined" sx={{ mb: 2.5 }}>
				<CardContent>
					<Chip icon={<FiPercent />} label="F&O Calculator" size="small" sx={{ mb: 1 }} />
					<Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Stoploss and P&L Planner</Typography>
					<Typography variant="body2" color="text.secondary">
						Calculate expected profit or loss and stoploss risk using lot size, quantity, entry price per lot and percentage inputs.
					</Typography>
					<Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
						Quantity is auto-computed from Total Capital / Amount Required Per Lot.
					</Typography>
				</CardContent>
			</Card>

			<Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.5 }}>
				<Card variant="outlined">
					<CardContent>
						<Typography variant="subtitle2" color="text.secondary">Inputs</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Inputs are prefilled with defaults. Edit any value directly.</Typography>

						<Button type="button" onClick={resetDefaults} variant="outlined" size="small" sx={{ mb: 2 }}>
							Reset defaults
						</Button>

						<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 2 }}>
							<Button
								type="button"
								onClick={() => setPositionType("SELLER")}
								variant={positionType === "SELLER" ? "contained" : "outlined"}
							>
								Seller
							</Button>
							<Button
								type="button"
								onClick={() => setPositionType("BUYER")}
								variant={positionType === "BUYER" ? "contained" : "outlined"}
							>
								Buyer
							</Button>
						</Box>

						<Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
							<TextField label="Lot" type="number" size="small" value={lotSize} onChange={(event) => setLotSize(event.target.value)} />
							<TextField label="Quantity (Auto)" type="number" size="small" value={calculations.quantityValue} disabled />
							<TextField label="Amount Required Per Lot" type="number" size="small" value={amountRequiredPerLot} onChange={(event) => setAmountRequiredPerLot(event.target.value)} />
							<TextField label="Total Capital" type="number" size="small" value={capital} onChange={(event) => setCapital(event.target.value)} />
							<TextField label="Entry Price Per Lot" type="number" size="small" value={pricePerLot} onChange={(event) => setPricePerLot(event.target.value)} />
							<TextField label="% Profit / Loss" type="number" size="small" value={profitLossPct} onChange={(event) => setProfitLossPct(event.target.value)} />
							<TextField label="% Stoploss" type="number" size="small" value={stoplossPct} onChange={(event) => setStoplossPct(event.target.value)} sx={{ gridColumn: { sm: "span 2" } }} />
						</Box>

						{calculations.stoplossTooHigh ? (
							<Alert severity="warning" sx={{ mt: 2 }} icon={<FiAlertTriangle />}>
								Stoploss percentage should be less than 100.
							</Alert>
						) : null}
					</CardContent>
				</Card>

				<Card variant="outlined">
					<CardContent>
						<Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>Computed</Typography>

						{!calculations.hasInput ? (
							<Typography variant="body2" color="text.secondary">Enter valid lot size, quantity and price per lot to see calculations.</Typography>
						) : (
							<Box sx={{ display: "grid", gap: 1.5 }}>
								<Card variant="outlined">
									<CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
										<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Formula Check</Typography>
										<Divider sx={{ my: 1 }} />
										<Box sx={{ display: "grid", gap: 0.5 }}>
											<Typography variant="caption" color="text.secondary">Quantity = floor(Capital / Required) = {formatNumber(calculations.quantityValue)}</Typography>
											<Typography variant="caption" color="text.secondary">Invested Amount = Quantity x Required = {formatMoney(calculations.investedAmount)}</Typography>
											<Typography variant="caption" color="text.secondary">Target Profit = {formatMoney(calculations.targetProfitAmountOnInvested)}</Typography>
											<Typography variant="caption" color="text.secondary">Max Loss = {formatMoney(calculations.maxLossAmountOnInvested)}</Typography>
										</Box>
									</CardContent>
								</Card>

								<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Capital And Sizing</Typography>
								<Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
									{metricCard("Capital", formatMoney(calculations.capitalValue))}
									{metricCard("Total Units", formatNumber(calculations.totalUnits))}
									{metricCard("Invested Amount", formatMoney(calculations.investedAmount), `Capital used: ${calculations.capitalUsagePct.toFixed(2)}%`)}
									{metricCard("Max Quantity", formatNumber(calculations.maxAffordableQuantity), `Remaining: ${formatMoney(calculations.remainingCapital)}`)}
								</Box>

								<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mt: 0.5 }}>Target And Risk</Typography>
								<Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
									{metricCard(positionType === "SELLER" ? "Target Buyback" : "Target Exit", formatMoney(calculations.targetExitAmountPerLot))}
									{metricCard(positionType === "SELLER" ? "Max Premium Profit" : "Max Premium Loss", formatMoney(calculations.premiumNotional), undefined, positionType === "SELLER" ? "success.main" : "error.main")}
									{metricCard(positionType === "SELLER" ? "Stoploss Buyback" : "Stoploss Exit", formatMoney(calculations.stoplossExitAmountPerLot))}
									{metricCard("Target Profit On Invested", formatMoney(calculations.targetProfitAmountOnInvested), `${calculations.targetProfitPctOnInvested.toFixed(2)}% of invested`, "success.main")}
									{metricCard("Max Loss On Invested", formatMoney(calculations.maxLossAmountOnInvested), `${calculations.stoplossPctOnInvested.toFixed(2)}% of invested`, "error.main")}
									{metricCard("P&L From Price Move", formatMoney(calculations.expectedPnL), `Stoploss scenario: ${formatMoney(-calculations.maxLoss)}`, calculations.expectedPnL >= 0 ? "success.main" : "error.main")}
									{metricCard("Risk : Reward", `1 : ${Number.isFinite(calculations.riskRewardRatio) ? calculations.riskRewardRatio.toFixed(2) : "0.00"}`)}
									{metricCard("Expected Turnover", formatMoney(calculations.expectedTurnover))}
									{metricCard("Expected P&L On Turnover", `${calculations.expectedPnLOnTurnoverPct.toFixed(2)}%`, undefined, calculations.expectedPnLOnTurnoverPct >= 0 ? "success.main" : "error.main")}
									{metricCard("Stoploss Turnover", formatMoney(calculations.stoplossTurnover))}
									{metricCard("Max Loss On Turnover", `${calculations.maxLossOnTurnoverPct.toFixed(2)}%`, undefined, "error.main")}
								</Box>
							</Box>
						)}
					</CardContent>
				</Card>
			</Box>
		</Container>
	);
}
