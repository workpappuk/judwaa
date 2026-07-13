package com.waajud.judwaa.modules.lms.student.entity;

import com.waajud.judwaa.modules.lms.school.entity.Classroom;
import com.waajud.judwaa.modules.lms.school.entity.SchoolOrganization;
import com.waajud.judwaa.modules.lms.school.entity.School;
import com.waajud.judwaa.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "students", indexes = {
		@Index(name = "idx_students_school", columnList = "school_id"),
		@Index(name = "idx_students_classroom", columnList = "classroom_id"),
		@Index(name = "idx_students_school_admission", columnList = "school_id,admission_no", unique = true),
		@Index(name = "idx_students_school_roll", columnList = "school_id,roll_no", unique = true)})
public class Student extends BaseEntity {

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "school_id", nullable = false, foreignKey = @ForeignKey(name = "fk_students_school"))
	private School school;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "classroom_id", nullable = false, foreignKey = @ForeignKey(name = "fk_students_classroom"))
	private Classroom classroom;

	@Column(name = "admission_no", nullable = false, length = 50)
	private String admissionNo;

	@Column(name = "roll_no", length = 50)
	private String rollNo;

	@Column(name = "first_name", nullable = false, length = 120)
	private String firstName;

	@Column(name = "last_name", length = 120)
	private String lastName;

	@Column(name = "gender", length = 20)
	private String gender;

	@Column(name = "date_of_birth")
	private LocalDate dateOfBirth;

	@Column(name = "guardian_name", length = 200)
	private String guardianName;

	@Column(name = "guardian_phone", length = 40)
	private String guardianPhone;

	@Column(name = "enrolled_at")
	private LocalDate enrolledAt;

	public School getSchool() {
		return school;
	}

	public void setSchool(School school) {
		this.school = school;
	}

	public Classroom getClassroom() {
		return classroom;
	}

	public void setClassroom(Classroom classroom) {
		this.classroom = classroom;
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
