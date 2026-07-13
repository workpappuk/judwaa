package com.waajud.judwaa.modules.lms.exam.entity;

import com.waajud.judwaa.modules.lms.student.entity.Student;
import com.waajud.judwaa.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "lms_exam_enrollments", indexes = {
		@Index(name = "idx_lms_exam_enrollments_exam", columnList = "exam_id"),
		@Index(name = "idx_lms_exam_enrollments_student", columnList = "student_id"),
		@Index(name = "idx_lms_exam_enrollments_exam_student", columnList = "exam_id,student_id", unique = true)})
public class ExamEnrollment extends BaseEntity {
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "exam_id", nullable = false, foreignKey = @ForeignKey(name = "fk_lms_exam_enrollments_exam"))
	private Exam exam;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "student_id", nullable = false, foreignKey = @ForeignKey(name = "fk_lms_exam_enrollments_student"))
	private Student student;

	@Column(name = "enrolled_at", nullable = false)
	private Instant enrolledAt;

	public Exam getExam() {
		return exam;
	}

	public void setExam(Exam exam) {
		this.exam = exam;
	}

	public Student getStudent() {
		return student;
	}

	public void setStudent(Student student) {
		this.student = student;
	}

	public Instant getEnrolledAt() {
		return enrolledAt;
	}

	public void setEnrolledAt(Instant enrolledAt) {
		this.enrolledAt = enrolledAt;
	}
}
