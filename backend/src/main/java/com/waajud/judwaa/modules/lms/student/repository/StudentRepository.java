package com.waajud.judwaa.modules.lms.student.repository;

import com.waajud.judwaa.modules.lms.student.entity.Student;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, UUID> {

	boolean existsBySchoolIdAndAdmissionNo(UUID schoolId, String admissionNo);

	boolean existsBySchoolIdAndAdmissionNoAndIdNot(UUID schoolId, String admissionNo, UUID id);

	boolean existsBySchoolIdAndRollNoAndIdNot(UUID schoolId, String rollNo, UUID id);

	Page<Student> findByOrganizationId(UUID organizationId, Pageable pageable);

	Page<Student> findBySchoolId(UUID schoolId, Pageable pageable);

	Page<Student> findByClassroomId(UUID classroomId, Pageable pageable);

	Page<Student> findBySchoolIdAndClassroomId(UUID schoolId, UUID classroomId, Pageable pageable);

	Page<Student> findByOrganizationIdAndSchoolId(UUID organizationId, UUID schoolId, Pageable pageable);

	Page<Student> findByOrganizationIdAndClassroomId(UUID organizationId, UUID classroomId, Pageable pageable);

	Page<Student> findByOrganizationIdAndSchoolIdAndClassroomId(UUID organizationId, UUID schoolId, UUID classroomId,
			Pageable pageable);

	List<Student> findBySchoolId(UUID schoolId);
}
