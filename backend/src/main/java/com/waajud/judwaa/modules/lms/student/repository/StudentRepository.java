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

	List<Student> findBySchoolId(UUID schoolId);
}
