package com.waajud.judwaa.modules.lms.seed;

import java.util.List;

public class JsonExamSectionSeed {
	private int displayOrder;
	private String title;
	private String description;
	private Double maxMarks;
	private List<JsonQuestionSeed> questions;

	public int getDisplayOrder() {
		return displayOrder;
	}

	public void setDisplayOrder(int displayOrder) {
		this.displayOrder = displayOrder;
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

	public Double getMaxMarks() {
		return maxMarks;
	}

	public void setMaxMarks(Double maxMarks) {
		this.maxMarks = maxMarks;
	}

	public List<JsonQuestionSeed> getQuestions() {
		return questions;
	}

	public void setQuestions(List<JsonQuestionSeed> questions) {
		this.questions = questions;
	}
}
