package com.waajud.judwaa.modules.lms.school.entity;

import com.waajud.judwaa.modules.auth.entity.BaseEntity;
import com.waajud.judwaa.modules.lms.common.enums.RecordStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "classrooms", indexes = {
		@Index(name = "idx_classrooms_school", columnList = "school_id"),
		@Index(name = "idx_classrooms_school_year_grade_section", columnList = "school_id,academic_year,grade,section", unique = true)})
public class Classroom extends BaseEntity {
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "school_id", nullable = false, foreignKey = @ForeignKey(name = "fk_classrooms_school"))
	private School school;

	@Column(name = "academic_year", nullable = false, length = 20)
	private String academicYear;

	@Column(nullable = false, length = 30)
	private String grade;

	@Column(nullable = false, length = 30)
	private String section;

	@Column(name = "class_teacher_name", length = 200)
	private String classTeacherName;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private RecordStatus status = RecordStatus.ACTIVE;

	public School getSchool() {
		return school;
	}

	public void setSchool(School school) {
		this.school = school;
	}

	public String getAcademicYear() {
		return academicYear;
	}

	public void setAcademicYear(String academicYear) {
		this.academicYear = academicYear;
	}

	public String getGrade() {
		return grade;
	}

	public void setGrade(String grade) {
		this.grade = grade;
	}

	public String getSection() {
		return section;
	}

	public void setSection(String section) {
		this.section = section;
	}

	public String getClassTeacherName() {
		return classTeacherName;
	}

	public void setClassTeacherName(String classTeacherName) {
		this.classTeacherName = classTeacherName;
	}

	public RecordStatus getStatus() {
		return status;
	}

	public void setStatus(RecordStatus status) {
		this.status = status;
	}
}
