"use client";

import { useState } from "react";
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

export default function FnOStoplossCalculatorPage() {
	const [positionType, setPositionType] = useState<"BUYER" | "SELLER">("SELLER");
	const [lotSize, setLotSize] = useState("1");
	const [pricePerLot, setPricePerLot] = useState("30");
	const [amountRequiredPerLot, setAmountRequiredPerLot] = useState("250000");
	const [capital, setCapital] = useState("2500000");
	const [profitLossPct, setProfitLossPct] = useState("2.2");
	const [stoplossPct, setStoplossPct] = useState("1");

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

	return (
		<main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
			<header className="rounded-2xl border border-zinc-200 bg-linear-to-br from-emerald-50 to-white p-5 shadow-sm dark:border-zinc-800 dark:from-emerald-950/40 dark:to-zinc-900">
				<p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
					<FiPercent className="h-3.5 w-3.5" />
					F&O Calculator
				</p>
				<h1 className="mt-2 text-2xl font-extrabold tracking-tight">Stoploss and P&L Planner</h1>
				<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
					Calculate expected profit or loss and stoploss risk using lot size, quantity, entry price per lot and
					percentage inputs.
				</p>
				<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
					Primary check is on invested amount. Seller mode is enabled by default.
				</p>
				<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
					Quantity is auto-computed from Total Capital / Amount Required Per Lot.
				</p>
				<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
					Example: 2.5 lakh per lot and 25 lakh capital allows up to 10 quantity at lot = 1.
				</p>
			</header>

			<section className="mt-5 grid gap-5 lg:grid-cols-2">
				<article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
					<h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Inputs</h2>
					<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Inputs are prefilled with defaults. Edit any value directly.</p>

					<div className="mt-4 space-y-3">
						<div className="grid grid-cols-2 gap-2">
							<button
								type="button"
								onClick={() => setPositionType("SELLER")}
								className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
									positionType === "SELLER"
										? "border-emerald-500 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
										: "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
								}`}
							>
								Seller
							</button>
							<button
								type="button"
								onClick={() => setPositionType("BUYER")}
								className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
									positionType === "BUYER"
										? "border-emerald-500 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
										: "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
								}`}
							>
								Buyer
							</button>
						</div>

						<label className="block">
							<span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Lot</span>
							<input
								type="number"
								min="0"
								step="1"
								value={lotSize}
								onChange={(event) => setLotSize(event.target.value)}
								className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
								placeholder="e.g. 25"
							/>
						</label>

						<label className="block">
							<span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Quantity (Auto)</span>
							<input
								type="number"
								min="0"
								step="1"
								value={calculations.quantityValue}
								readOnly
								className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900"
								placeholder="e.g. 2"
							/>
						</label>

						<label className="block">
							<span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Amount Required Per Lot</span>
							<input
								type="number"
								min="0"
								step="0.01"
								value={amountRequiredPerLot}
								onChange={(event) => setAmountRequiredPerLot(event.target.value)}
								className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
								placeholder="e.g. 3000"
							/>
						</label>

						<label className="block">
							<span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Total Capital</span>
							<input
								type="number"
								min="0"
								step="0.01"
								value={capital}
								onChange={(event) => setCapital(event.target.value)}
								className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
								placeholder="e.g. 2500000"
							/>
						</label>

						<label className="block">
							<span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Entry Price Per Lot</span>
							<input
								type="number"
								min="0"
								step="0.01"
								value={pricePerLot}
								onChange={(event) => setPricePerLot(event.target.value)}
								className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
								placeholder="e.g. 120"
							/>
						</label>

						<label className="block">
							<span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">% Profit / Loss (target move)</span>
							<input
								type="number"
								step="0.01"
								value={profitLossPct}
								onChange={(event) => setProfitLossPct(event.target.value)}
								className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
								placeholder="e.g. 5 or -3"
							/>
						</label>

						<label className="block">
							<span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">% Stoploss</span>
							<input
								type="number"
								min="0"
								step="0.01"
								value={stoplossPct}
								onChange={(event) => setStoplossPct(event.target.value)}
								className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
								placeholder="e.g. 2"
							/>
						</label>
					</div>

					{calculations.stoplossTooHigh ? (
						<div className="mt-4 inline-flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
							<FiAlertTriangle className="mt-0.5 h-3.5 w-3.5" />
							Stoploss percentage should be less than 100.
						</div>
					) : null}
				</article>

				<article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
					<h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Computed</h2>

					{!calculations.hasInput ? (
						<p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
							Enter valid lot size, quantity and price per lot to see calculations.
						</p>
					) : (
						<div className="mt-4 space-y-4">
							<section className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
								<h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Formula Check</h3>
								<div className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
									<p>
										Quantity = floor(Total Capital / Amount Required Per Lot) = floor({formatMoney(calculations.capitalValue)} / {formatMoney(calculations.amountRequiredPerLotValue)}) = {formatNumber(calculations.quantityValue)}
									</p>
									<p>
										Invested Amount = Quantity x Amount Required Per Lot = {formatNumber(calculations.quantityValue)} x {formatMoney(calculations.amountRequiredPerLotValue)} = {formatMoney(calculations.investedAmount)}
									</p>
									<p>
										Target Profit = Invested Amount x Target % = {formatMoney(calculations.investedAmount)} x {calculations.profitLossPctValue.toFixed(2)}% = {formatMoney(calculations.targetProfitAmountOnInvested)}
									</p>
									<p>
										Max Loss = Invested Amount x Stoploss % = {formatMoney(calculations.investedAmount)} x {calculations.stoplossPctValue.toFixed(2)}% = {formatMoney(calculations.maxLossAmountOnInvested)}
									</p>
									<p>
										{positionType === "SELLER" ? "Target Buyback Amount Per Lot" : "Target Exit Amount Per Lot"} = Amount Required Per Lot x (1 {positionType === "SELLER" ? "-" : "+"} Target %) = {formatMoney(calculations.amountRequiredPerLotValue)} x (1 {positionType === "SELLER" ? "-" : "+"} {calculations.profitLossPctValue.toFixed(4)}) = {formatMoney(calculations.targetExitAmountPerLot)}
									</p>
									<p>
										{positionType === "SELLER" ? "Stoploss Buyback Amount Per Lot" : "Stoploss Exit Amount Per Lot"} = Amount Required Per Lot x (1 {positionType === "SELLER" ? "+" : "-"} Stoploss %) = {formatMoney(calculations.amountRequiredPerLotValue)} x (1 {positionType === "SELLER" ? "+" : "-"} {calculations.stoplossPctValue.toFixed(4)}) = {formatMoney(calculations.stoplossExitAmountPerLot)}
									</p>
									<p>
										{positionType === "SELLER" ? "Max Premium Profit" : "Max Premium Loss"} = Lot Size x Quantity x Entry Price = {formatNumber(calculations.lotSizeValue)} x {formatNumber(calculations.quantityValue)} x {formatMoney(calculations.pricePerLotValue)} = {formatMoney(calculations.premiumNotional)}
									</p>
								</div>
							</section>

							<section className="space-y-2">
								<h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Capital And Sizing</h3>
							<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
								<p className="text-xs text-zinc-500">Capital</p>
								<p className="text-sm font-semibold">{formatMoney(calculations.capitalValue)}</p>
							</div>

							<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
								<p className="text-xs text-zinc-500">Total Units (Lot Size x Quantity)</p>
								<p className="text-sm font-semibold">{formatNumber(calculations.totalUnits)}</p>
							</div>

							<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
								<p className="text-xs text-zinc-500">Invested Amount</p>
								<p className="text-sm font-semibold">{formatMoney(calculations.investedAmount)}</p>
								<p className={`text-xs ${calculations.overCapital ? "text-rose-600" : "text-zinc-500"}`}>
									Capital used: {calculations.capitalUsagePct.toFixed(2)}%
								</p>
							</div>

							<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
								<p className="text-xs text-zinc-500">Max Quantity You Can Take</p>
								<p className="text-sm font-semibold">{formatNumber(calculations.maxAffordableQuantity)}</p>
								<p className={`text-xs ${calculations.remainingCapital < 0 ? "text-rose-600" : "text-zinc-500"}`}>
									Remaining capital: {formatMoney(calculations.remainingCapital)}
								</p>
							</div>
							</section>

							<section className="space-y-2">
								<h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Target And Risk</h3>
							<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
								<p className="text-xs text-zinc-500">{positionType === "SELLER" ? "Target Buyback Amount Per Lot" : "Target Exit Amount Per Lot"}</p>
								<p className="text-sm font-semibold">{formatMoney(calculations.targetExitAmountPerLot)}</p>
							</div>

							<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
								<p className="text-xs text-zinc-500">{positionType === "SELLER" ? "Max Premium Profit" : "Max Premium Loss"}</p>
								<p className={`text-sm font-semibold ${positionType === "SELLER" ? "text-emerald-600" : "text-rose-600"}`}>
									{formatMoney(calculations.premiumNotional)}
								</p>
							</div>

							<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
								<p className="text-xs text-zinc-500">{positionType === "SELLER" ? "Stoploss Buyback Amount Per Lot" : "Stoploss Exit Amount Per Lot"}</p>
								<p className="text-sm font-semibold">{formatMoney(calculations.stoplossExitAmountPerLot)}</p>
							</div>

							<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
								<p className="inline-flex items-center gap-1 text-xs text-zinc-500">
									<FiTrendingUp className="h-3.5 w-3.5" />
									Target Profit On Invested Amount
								</p>
								<p className="text-sm font-semibold text-emerald-600">
									{formatMoney(calculations.targetProfitAmountOnInvested)}
								</p>
								<p className="text-xs text-emerald-600">
									{calculations.targetProfitPctOnInvested.toFixed(2)}% of invested amount
								</p>
							</div>

							<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
								<p className="inline-flex items-center gap-1 text-xs text-zinc-500">
									<FiTrendingDown className="h-3.5 w-3.5" />
									Max Loss On Invested Amount
								</p>
								<p className="text-sm font-semibold text-rose-600">{formatMoney(calculations.maxLossAmountOnInvested)}</p>
								<p className="text-xs text-rose-600">{calculations.stoplossPctOnInvested.toFixed(2)}% of invested amount</p>
							</div>

							<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
								<p className="text-xs text-zinc-500">P&amp;L From Entry/Exit Price Move</p>
								<p className={`text-sm font-semibold ${calculations.expectedPnL >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
									{formatMoney(calculations.expectedPnL)}
								</p>
								<p className="text-xs text-zinc-500">Stoploss scenario: {formatMoney(-calculations.maxLoss)}</p>
							</div>

							<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
								<p className="text-xs text-zinc-500">Risk : Reward</p>
								<p className="text-sm font-semibold">
									1 : {Number.isFinite(calculations.riskRewardRatio) ? calculations.riskRewardRatio.toFixed(2) : "0.00"}
								</p>
							</div>

							<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
								<p className="text-xs text-zinc-500">Expected Turnover (Buy + Sell)</p>
								<p className="text-sm font-semibold">{formatMoney(calculations.expectedTurnover)}</p>
							</div>

							<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
								<p className="text-xs text-zinc-500">Expected P&amp;L On Turnover</p>
								<p className={`text-sm font-semibold ${calculations.expectedPnLOnTurnoverPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
									{calculations.expectedPnLOnTurnoverPct.toFixed(2)}%
								</p>
							</div>

							<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
								<p className="text-xs text-zinc-500">Stoploss Turnover (Buy + Sell)</p>
								<p className="text-sm font-semibold">{formatMoney(calculations.stoplossTurnover)}</p>
							</div>

							<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
								<p className="text-xs text-zinc-500">Max Loss On Turnover</p>
								<p className="text-sm font-semibold text-rose-600">{calculations.maxLossOnTurnoverPct.toFixed(2)}%</p>
							</div>
							</section>
						</div>
					)}
				</article>
			</section>
		</main>
	);
}
