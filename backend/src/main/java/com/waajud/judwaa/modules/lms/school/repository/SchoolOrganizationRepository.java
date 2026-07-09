package com.waajud.judwaa.modules.lms.school.repository;

import com.waajud.judwaa.modules.lms.school.entity.SchoolOrganization;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolOrganizationRepository extends JpaRepository<SchoolOrganization, UUID> {
	boolean existsByCode(String code);

	boolean existsByCodeAndIdNot(String code, UUID id);
}
