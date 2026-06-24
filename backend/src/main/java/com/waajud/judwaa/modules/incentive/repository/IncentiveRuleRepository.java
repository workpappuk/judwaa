package com.waajud.judwaa.modules.incentive.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.waajud.judwaa.modules.incentive.entity.IncentiveRule;

public interface IncentiveRuleRepository extends JpaRepository<IncentiveRule, UUID> {
	Page<IncentiveRule> findBySchemeId(UUID schemeId, Pageable pageable);

	long countBySchemeId(UUID schemeId);
}
