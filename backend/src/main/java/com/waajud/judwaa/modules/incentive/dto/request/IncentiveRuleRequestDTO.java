package com.waajud.judwaa.modules.incentive.dto.request;

import com.waajud.judwaa.modules.incentive.enums.IncentiveConflictStrategy;
import com.waajud.judwaa.modules.incentive.enums.IncentiveRuleStatus;
import com.waajud.judwaa.modules.incentive.enums.IncentiveRuleType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class IncentiveRuleRequestDTO {
	@NotBlank
	private String name;

	@NotNull
	private IncentiveRuleType type;

	@Min(1)
	private int priority;

	@NotNull
	private IncentiveRuleStatus status;

	@NotNull
	private IncentiveConflictStrategy conflictStrategy;

	@NotBlank
	private String conditionsJson;

	private String slabsJson;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public IncentiveRuleType getType() {
		return type;
	}

	public void setType(IncentiveRuleType type) {
		this.type = type;
	}

	public int getPriority() {
		return priority;
	}

	public void setPriority(int priority) {
		this.priority = priority;
	}

	public IncentiveRuleStatus getStatus() {
		return status;
	}

	public void setStatus(IncentiveRuleStatus status) {
		this.status = status;
	}

	public IncentiveConflictStrategy getConflictStrategy() {
		return conflictStrategy;
	}

	public void setConflictStrategy(IncentiveConflictStrategy conflictStrategy) {
		this.conflictStrategy = conflictStrategy;
	}

	public String getConditionsJson() {
		return conditionsJson;
	}

	public void setConditionsJson(String conditionsJson) {
		this.conditionsJson = conditionsJson;
	}

	public String getSlabsJson() {
		return slabsJson;
	}

	public void setSlabsJson(String slabsJson) {
		this.slabsJson = slabsJson;
	}
}
