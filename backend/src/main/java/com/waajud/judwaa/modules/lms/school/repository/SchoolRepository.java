package com.waajud.judwaa.modules.lms.school.repository;

import com.waajud.judwaa.modules.lms.school.entity.School;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolRepository extends JpaRepository<School, UUID> {
	Page<School> findByOrganizationId(UUID organizationId, Pageable pageable);

	boolean existsByOrganizationIdAndCode(UUID organizationId, String code);

	boolean existsByOrganizationIdAndCodeAndIdNot(UUID organizationId, String code, UUID id);
}
