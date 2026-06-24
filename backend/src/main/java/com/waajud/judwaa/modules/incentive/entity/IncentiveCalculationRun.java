package com.waajud.judwaa.modules.incentive.entity;

import java.time.Instant;

import com.waajud.judwaa.modules.auth.entity.BaseEntity;
import com.waajud.judwaa.modules.incentive.enums.IncentiveRunStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "incentive_calculation_runs", indexes = {
		@Index(name = "idx_incentive_run_scheme_run_at", columnList = "scheme_id,run_at"),
		@Index(name = "idx_incentive_run_status", columnList = "status")})
public class IncentiveCalculationRun extends BaseEntity {
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "scheme_id", nullable = false)
	private IncentiveScheme scheme;

	@Column(name = "run_at", nullable = false)
	private Instant runAt;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private IncentiveRunStatus status = IncentiveRunStatus.RUNNING;

	@Column(nullable = false)
	private long distributors;

	@Column(name = "total_payout", nullable = false)
	private long totalPayout;

	@Column(name = "duration_ms", nullable = false)
	private long durationMs;

	public IncentiveScheme getScheme() {
		return scheme;
	}

	public void setScheme(IncentiveScheme scheme) {
		this.scheme = scheme;
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
