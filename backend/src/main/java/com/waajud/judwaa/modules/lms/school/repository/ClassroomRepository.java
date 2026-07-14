package com.waajud.judwaa.modules.lms.school.repository;

import com.waajud.judwaa.modules.lms.school.entity.Classroom;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.waajud.judwaa.modules.lms.school.entity.School;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClassroomRepository extends JpaRepository<Classroom, UUID> {
	Optional<Classroom> findByIdAndSchoolId(UUID id, UUID schoolId);

    @Query("select c from Classroom c where c.school.id = :schoolId")
    Page<Classroom> findPageBySchoolId(@Param("schoolId") UUID schoolId, Pageable pageable);

    @Query("select c from Classroom c where c.school.organization.id = :organizationId")
    Page<Classroom> findPageByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    List<Classroom> findByGradeAndSection(String grade, String section);

     Classroom findByGradeAndSectionAndSchool(String grade, String section, School  school);
}
