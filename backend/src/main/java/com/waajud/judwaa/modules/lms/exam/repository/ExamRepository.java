package com.waajud.judwaa.modules.lms.exam.repository;

import com.waajud.judwaa.modules.lms.exam.entity.Exam;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ExamRepository extends JpaRepository<Exam, UUID>, JpaSpecificationExecutor<Exam> {
	boolean existsByOrganizationIdAndCode(UUID organizationId, String code);

	boolean existsByOrganizationIdAndCodeAndIdNot(UUID organizationId, String code, UUID id);

	Optional<Exam> findByOrganizationIdAndCode(UUID organizationId, String code);
}
