package com.waajud.judwaa.modules.incentive.dto.response;

import java.time.Instant;
import java.util.UUID;

import com.waajud.judwaa.modules.incentive.enums.IncentiveConflictStrategy;
import com.waajud.judwaa.modules.incentive.enums.IncentiveRuleStatus;
import com.waajud.judwaa.modules.incentive.enums.IncentiveRuleType;

public class IncentiveRuleResponseDTO {
	private UUID id;
	private UUID schemeId;
	private String name;
	private IncentiveRuleType type;
	private int priority;
	private IncentiveRuleStatus status;
	private IncentiveConflictStrategy conflictStrategy;
	private String conditionsJson;
	private String slabsJson;
	private Instant createdAt;

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

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Instant createdAt) {
		this.createdAt = createdAt;
	}
}
