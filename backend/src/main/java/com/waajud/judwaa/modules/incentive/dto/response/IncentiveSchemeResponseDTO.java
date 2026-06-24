package com.waajud.judwaa.modules.incentive.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.waajud.judwaa.modules.incentive.enums.IncentiveSchemeStatus;

public class IncentiveSchemeResponseDTO {
	private UUID id;
	private String name;
	private String description;
	private IncentiveSchemeStatus status;
	private LocalDate startDate;
	private LocalDate endDate;
	private int version;
	private int totalRules;
	private Instant lastRunAt;

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
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
