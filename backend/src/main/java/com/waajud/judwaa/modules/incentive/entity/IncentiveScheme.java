package com.waajud.judwaa.modules.incentive.entity;

import java.time.Instant;
import java.time.LocalDate;

import com.waajud.judwaa.modules.auth.entity.BaseEntity;
import com.waajud.judwaa.modules.incentive.enums.IncentiveSchemeStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "incentive_schemes", indexes = {@Index(name = "idx_incentive_scheme_status", columnList = "status"),
		@Index(name = "idx_incentive_scheme_period", columnList = "start_date,end_date")})
public class IncentiveScheme extends BaseEntity {
	@Column(nullable = false, length = 150)
	private String name;

	@Column(length = 1000)
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private IncentiveSchemeStatus status = IncentiveSchemeStatus.DRAFT;

	@Column(name = "start_date", nullable = false)
	private LocalDate startDate;

	@Column(name = "end_date", nullable = false)
	private LocalDate endDate;

	@Column(nullable = false)
	private int version = 1;

	@Column(name = "total_rules", nullable = false)
	private int totalRules = 0;

	@Column(name = "last_run_at")
	private Instant lastRunAt;

	@PrePersist
	public void initializeDefaults() {
		if (version < 1) {
			version = 1;
		}
		if (totalRules < 0) {
			totalRules = 0;
		}
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public IncentiveSchemeStatus getStatus() {
		return status;
	}

	public void setStatus(IncentiveSchemeStatus status) {
		this.status = status;
	}

	public LocalDate getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}

	public LocalDate getEndDate() {
		return endDate;
	}

	public void setEndDate(LocalDate endDate) {
		this.endDate = endDate;
	}

	public int getVersion() {
		return version;
	}

	public void setVersion(int version) {
		this.version = version;
	}

	public int getTotalRules() {
		return totalRules;
	}

	public void setTotalRules(int totalRules) {
		this.totalRules = totalRules;
	}

	public Instant getLastRunAt() {
		return lastRunAt;
	}

	public void setLastRunAt(Instant lastRunAt) {
		this.lastRunAt = lastRunAt;
	}
}
