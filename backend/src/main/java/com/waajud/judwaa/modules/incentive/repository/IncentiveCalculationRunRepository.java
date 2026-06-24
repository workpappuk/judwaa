package com.waajud.judwaa.modules.incentive.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.waajud.judwaa.modules.incentive.entity.IncentiveCalculationRun;

public interface IncentiveCalculationRunRepository extends JpaRepository<IncentiveCalculationRun, UUID> {
	Page<IncentiveCalculationRun> findBySchemeId(UUID schemeId, Pageable pageable);
}
