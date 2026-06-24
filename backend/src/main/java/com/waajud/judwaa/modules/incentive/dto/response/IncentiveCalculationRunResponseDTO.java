package com.waajud.judwaa.modules.incentive.dto.response;

import java.time.Instant;
import java.util.UUID;

import com.waajud.judwaa.modules.incentive.enums.IncentiveRunStatus;

public class IncentiveCalculationRunResponseDTO {
	private UUID id;
	private UUID schemeId;
	private Instant runAt;
	private IncentiveRunStatus status;
	private long distributors;
	private long totalPayout;
	private long durationMs;

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public UUID getSchemeId() {
		return schemeId;
	}

	public void setSchemeId(UUID schemeId) {
		this.schemeId = schemeId;
	}

	public Instant getRunAt() {
		return runAt;
	}

	public void setRunAt(Instant runAt) {
		this.runAt = runAt;
	}

	public IncentiveRunStatus getStatus() {
		return status;
	}

	public void setStatus(IncentiveRunStatus status) {
		this.status = status;
	}

	public long getDistributors() {
		return distributors;
	}

	public void setDistributors(long distributors) {
		this.distributors = distributors;
	}

	public long getTotalPayout() {
		return totalPayout;
	}

	public void setTotalPayout(long totalPayout) {
		this.totalPayout = totalPayout;
	}

	public long getDurationMs() {
		return durationMs;
	}

	public void setDurationMs(long durationMs) {
		this.durationMs = durationMs;
	}
}
