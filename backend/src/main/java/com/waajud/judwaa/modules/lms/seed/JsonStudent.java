package com.waajud.judwaa.modules.lms.seed;

public class JsonStudent {
	private String schoolCode;
	private CurrentClass currentClass;
	private String admissionNo;
	private String rollNo;
	private String firstName;
	private String lastName;
	private String gender;
	private String dateOfBirth;
	private String guardianName;
	private String guardianPhone;
	private String enrolledAt;

	public String getSchoolCode() {
		return schoolCode;
	}

	public void setSchoolCode(String schoolCode) {
		this.schoolCode = schoolCode;
	}

	public CurrentClass getCurrentClass() {
		return currentClass;
	}

	public void setCurrentClass(CurrentClass currentClass) {
		this.currentClass = currentClass;
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

	public String getDateOfBirth() {
		return dateOfBirth;
	}

	public void setDateOfBirth(String dateOfBirth) {
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

	public String getEnrolledAt() {
		return enrolledAt;
	}

	public void setEnrolledAt(String enrolledAt) {
		this.enrolledAt = enrolledAt;
	}
}
