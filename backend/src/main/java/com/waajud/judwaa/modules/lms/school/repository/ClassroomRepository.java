package com.waajud.judwaa.modules.lms.school.repository;

import com.waajud.judwaa.modules.lms.school.entity.Classroom;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.waajud.judwaa.modules.lms.school.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassroomRepository extends JpaRepository<Classroom, UUID> {
	Optional<Classroom> findByIdAndSchoolId(UUID id, UUID schoolId);

    List<Classroom> findByGradeAndSection(String grade, String section);

     Classroom findByGradeAndSectionAndSchool(String grade, String section, School  school);
}
