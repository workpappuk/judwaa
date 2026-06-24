package com.waajud.judwaa.modules.incentive.dto.request;

import java.time.LocalDate;

import com.waajud.judwaa.modules.incentive.enums.IncentiveSchemeStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class IncentiveSchemeRequestDTO {
	@NotBlank
	private String name;

	private String description;

	@NotNull
	private IncentiveSchemeStatus status;

	@NotNull
	private LocalDate startDate;

	@NotNull
	private LocalDate endDate;

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
}
