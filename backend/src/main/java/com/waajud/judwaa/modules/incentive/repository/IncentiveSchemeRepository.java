package com.waajud.judwaa.modules.incentive.repository;

import java.util.UUID;

import com.waajud.judwaa.shared.RecordStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.waajud.judwaa.modules.incentive.entity.IncentiveScheme;

public interface IncentiveSchemeRepository extends JpaRepository<IncentiveScheme, UUID> {
	Page<IncentiveScheme> findByStatus(RecordStatus status, Pageable pageable);
}
