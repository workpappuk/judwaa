package com.waajud.judwaa.modules.incentive.dto.response;

import com.waajud.judwaa.shared.RecordStatus;

import java.time.Instant;
import java.util.UUID;

public class IncentiveCalculationRunResponseDTO {
	private UUID id;
	private UUID schemeId;
	private Instant runAt;
	private RecordStatus status;
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

	public RecordStatus getStatus() {
		return status;
	}

	public void setStatus(RecordStatus status) {
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
