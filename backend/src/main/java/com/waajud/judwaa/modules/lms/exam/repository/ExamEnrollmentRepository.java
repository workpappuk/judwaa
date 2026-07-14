package com.waajud.judwaa.modules.lms.exam.repository;

import com.waajud.judwaa.modules.lms.exam.entity.ExamEnrollment;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamEnrollmentRepository extends JpaRepository<ExamEnrollment, UUID> {
	boolean existsByExamIdAndStudentId(UUID examId, UUID studentId);

	long countByExamId(UUID examId);
}
