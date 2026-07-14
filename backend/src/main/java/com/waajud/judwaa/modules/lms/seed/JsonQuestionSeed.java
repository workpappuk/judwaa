package com.waajud.judwaa.modules.lms.seed;

import java.util.List;

public class JsonQuestionSeed {
	private int displayOrder;
	private String questionType;
	private String questionText;
	private double marks;
	private boolean mandatory;
	private List<JsonQuestionOptionSeed> options;

	public int getDisplayOrder() {
		return displayOrder;
	}

	public void setDisplayOrder(int displayOrder) {
		this.displayOrder = displayOrder;
	}

	public String getQuestionType() {
		return questionType;
	}

	public void setQuestionType(String questionType) {
		this.questionType = questionType;
	}

	public String getQuestionText() {
		return questionText;
	}

	public void setQuestionText(String questionText) {
		this.questionText = questionText;
	}

	public double getMarks() {
		return marks;
	}

	public void setMarks(double marks) {
		this.marks = marks;
	}

	public boolean isMandatory() {
		return mandatory;
	}

	public void setMandatory(boolean mandatory) {
		this.mandatory = mandatory;
	}

	public List<JsonQuestionOptionSeed> getOptions() {
		return options;
	}

	public void setOptions(List<JsonQuestionOptionSeed> options) {
		this.options = options;
	}
}
