package com.waajud.judwaa.modules.lms.exam.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class ExamSectionRequestDTO {
	@NotNull
	private Integer displayOrder;

	@NotBlank
	private String title;

	private String description;
	private Double maxMarks;

	@Valid
	private List<QuestionRequestDTO> questions = new ArrayList<>();

	public Integer getDisplayOrder() {
		return displayOrder;
	}

	public void setDisplayOrder(Integer displayOrder) {
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

	public List<QuestionRequestDTO> getQuestions() {
		return questions;
	}

	public void setQuestions(List<QuestionRequestDTO> questions) {
		this.questions = questions;
	}
}
