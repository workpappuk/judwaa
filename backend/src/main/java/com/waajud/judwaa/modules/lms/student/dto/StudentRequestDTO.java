package com.waajud.judwaa.modules.lms.student.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public class StudentRequestDTO {
	@NotNull
	private UUID organizationId;

	@NotNull
	private UUID schoolId;

	@NotNull
	private UUID classroomId;

	@NotBlank
	private String admissionNo;

	private String rollNo;

	@NotBlank
	private String firstName;

	private String lastName;
	private String gender;
	private LocalDate dateOfBirth;
	private String guardianName;
	private String guardianPhone;
	private LocalDate enrolledAt;

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

	public UUID getClassroomId() {
		return classroomId;
	}

	public void setClassroomId(UUID classroomId) {
		this.classroomId = classroomId;
	}

	public String getAdmissionNo() {
		return admissionNo;
	}

	public void setAdmissionNo(String admissionNo) {
		this.admissionNo = admissionNo;
	}

	public String getRollNo() {
		return rollNo;
	}

	public void setRollNo(String rollNo) {
		this.rollNo = rollNo;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public LocalDate getDateOfBirth() {
		return dateOfBirth;
	}

	public void setDateOfBirth(LocalDate dateOfBirth) {
		this.dateOfBirth = dateOfBirth;
	}

	public String getGuardianName() {
		return guardianName;
	}

	public void setGuardianName(String guardianName) {
		this.guardianName = guardianName;
	}

	public String getGuardianPhone() {
		return guardianPhone;
	}

	public void setGuardianPhone(String guardianPhone) {
		this.guardianPhone = guardianPhone;
	}

	public LocalDate getEnrolledAt() {
		return enrolledAt;
	}

	public void setEnrolledAt(LocalDate enrolledAt) {
		this.enrolledAt = enrolledAt;
	}
}
