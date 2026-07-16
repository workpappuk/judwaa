package com.waajud.judwaa.modules.lms.school.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class ClassroomRequestDTO {
	@NotNull
	private UUID organizationId;

	@NotNull
	private UUID schoolId;

	@NotBlank
	private String academicYear;

	@NotBlank
	private String grade;

	@NotBlank
	private String section;

	private String classTeacherName;

	public UUID getOrganizationId() {
		return organizationId;
	}

	public void setOrganizationId(UUID organizationId) {
		this.organizationId = organizationId;
	}

	public UUID getSchoolId() {
		return schoolId;
	}

	public void setSchoolId(UUID schoolId) {
		this.schoolId = schoolId;
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
}
