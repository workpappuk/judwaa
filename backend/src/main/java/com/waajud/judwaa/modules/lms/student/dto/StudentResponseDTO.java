package com.waajud.judwaa.modules.lms.student.dto;

import com.waajud.judwaa.shared.RecordStatus;
import java.time.LocalDate;
import java.util.UUID;

public class StudentResponseDTO {
	private UUID id;
	private UUID organizationId;
	private UUID schoolId;
	private UUID classroomId;
	private String admissionNo;
	private String rollNo;
	private String firstName;
	private String lastName;
	private String gender;
	private LocalDate dateOfBirth;
	private String guardianName;
	private String guardianPhone;
	private LocalDate enrolledAt;
	private RecordStatus status;

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

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

	public RecordStatus getStatus() {
		return status;
	}

	public void setStatus(RecordStatus status) {
		this.status = status;
	}
}
