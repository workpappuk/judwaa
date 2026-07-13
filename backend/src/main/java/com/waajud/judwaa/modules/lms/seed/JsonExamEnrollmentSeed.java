package com.waajud.judwaa.modules.lms.seed;

import java.util.List;

public class JsonExamEnrollmentSeed {
	private String schoolCode;
	private String examCode;
	private List<String> studentAdmissionNos;

	public String getSchoolCode() {
		return schoolCode;
	}

	public void setSchoolCode(String schoolCode) {
		this.schoolCode = schoolCode;
	}

	public String getExamCode() {
		return examCode;
	}

	public void setExamCode(String examCode) {
		this.examCode = examCode;
	}

	public List<String> getStudentAdmissionNos() {
		return studentAdmissionNos;
	}

	public void setStudentAdmissionNos(List<String> studentAdmissionNos) {
		this.studentAdmissionNos = studentAdmissionNos;
	}
}
