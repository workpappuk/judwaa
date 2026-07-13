package com.waajud.judwaa.modules.lms.seed;

import java.util.List;

public class JsonExamSeed {
	private String schoolCode;
	private String code;
	private String title;
	private String description;
	private String examType;
	private int startAfterMinutes;
	private int durationMinutes;
	private Double totalMarks;
	private List<JsonExamSectionSeed> sections;

	public String getSchoolCode() {
		return schoolCode;
	}

	public void setSchoolCode(String schoolCode) {
		this.schoolCode = schoolCode;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getExamType() {
		return examType;
	}

	public void setExamType(String examType) {
		this.examType = examType;
	}

	public int getStartAfterMinutes() {
		return startAfterMinutes;
	}

	public void setStartAfterMinutes(int startAfterMinutes) {
		this.startAfterMinutes = startAfterMinutes;
	}

	public int getDurationMinutes() {
		return durationMinutes;
	}

	public void setDurationMinutes(int durationMinutes) {
		this.durationMinutes = durationMinutes;
	}

	public Double getTotalMarks() {
		return totalMarks;
	}

	public void setTotalMarks(Double totalMarks) {
		this.totalMarks = totalMarks;
	}

	public List<JsonExamSectionSeed> getSections() {
		return sections;
	}

	public void setSections(List<JsonExamSectionSeed> sections) {
		this.sections = sections;
	}
}
