package com.waajud.judwaa.modules.incentive.entity;

import com.waajud.judwaa.modules.auth.entity.BaseEntity;
import com.waajud.judwaa.modules.incentive.enums.IncentiveConflictStrategy;
import com.waajud.judwaa.modules.incentive.enums.IncentiveRuleStatus;
import com.waajud.judwaa.modules.incentive.enums.IncentiveRuleType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "incentive_rules", indexes = {
		@Index(name = "idx_incentive_rule_scheme_priority", columnList = "scheme_id,priority"),
		@Index(name = "idx_incentive_rule_status", columnList = "status")})
public class IncentiveRule extends BaseEntity {
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "scheme_id", nullable = false)
	private IncentiveScheme scheme;

	@Column(nullable = false, length = 150)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private IncentiveRuleType type;

	@Column(nullable = false)
	private int priority;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private IncentiveRuleStatus status = IncentiveRuleStatus.ACTIVE;

	@Enumerated(EnumType.STRING)
	@Column(name = "conflict_strategy", nullable = false, length = 20)
	private IncentiveConflictStrategy conflictStrategy = IncentiveConflictStrategy.ADDITIVE;

	@Lob
	@Column(name = "conditions_json", nullable = false)
	private String conditionsJson;

	@Lob
	@Column(name = "slabs_json")
	private String slabsJson;

	public IncentiveScheme getScheme() {
		return scheme;
	}

	public void setScheme(IncentiveScheme scheme) {
		this.scheme = scheme;
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
}
