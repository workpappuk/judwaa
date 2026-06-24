package com.waajud.judwaa.modules.incentive.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.waajud.judwaa.modules.incentive.entity.IncentiveScheme;
import com.waajud.judwaa.modules.incentive.enums.IncentiveSchemeStatus;

public interface IncentiveSchemeRepository extends JpaRepository<IncentiveScheme, UUID> {
	Page<IncentiveScheme> findByStatus(IncentiveSchemeStatus status, Pageable pageable);
}
