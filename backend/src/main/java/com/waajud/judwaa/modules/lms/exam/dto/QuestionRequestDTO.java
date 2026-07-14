package com.waajud.judwaa.modules.lms.exam.dto;

import com.waajud.judwaa.modules.lms.exam.entity.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class QuestionRequestDTO {
	@NotNull
	private Integer displayOrder;

	@NotNull
	private QuestionType questionType;

	@NotBlank
	private String questionText;

	@NotNull
	private Double marks;

	private boolean mandatory = true;

	private String explanation;

	@Valid
	private List<QuestionOptionRequestDTO> options = new ArrayList<>();

	public Integer getDisplayOrder() {
		return displayOrder;
	}

	public void setDisplayOrder(Integer displayOrder) {
		this.displayOrder = displayOrder;
	}

	public QuestionType getQuestionType() {
		return questionType;
	}

	public void setQuestionType(QuestionType questionType) {
		this.questionType = questionType;
	}

	public String getQuestionText() {
		return questionText;
	}

	public void setQuestionText(String questionText) {
		this.questionText = questionText;
	}

	public Double getMarks() {
		return marks;
	}

	public void setMarks(Double marks) {
		this.marks = marks;
	}

	public boolean isMandatory() {
		return mandatory;
	}

	public void setMandatory(boolean mandatory) {
		this.mandatory = mandatory;
	}

	public String getExplanation() {
		return explanation;
	}

	public void setExplanation(String explanation) {
		this.explanation = explanation;
	}

	public List<QuestionOptionRequestDTO> getOptions() {
		return options;
	}

	public void setOptions(List<QuestionOptionRequestDTO> options) {
		this.options = options;
	}
}
