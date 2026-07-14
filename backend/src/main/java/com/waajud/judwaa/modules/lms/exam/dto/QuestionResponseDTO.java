package com.waajud.judwaa.modules.lms.exam.dto;

import com.waajud.judwaa.modules.lms.exam.entity.QuestionType;
import com.waajud.judwaa.shared.RecordStatus;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class QuestionResponseDTO {
	private UUID id;
	private Integer displayOrder;
	private QuestionType questionType;
	private String questionText;
	private Double marks;
	private boolean mandatory;
	private String explanation;
	private RecordStatus status;
	private List<QuestionOptionResponseDTO> options = new ArrayList<>();

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

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

	public RecordStatus getStatus() {
		return status;
	}

	public void setStatus(RecordStatus status) {
		this.status = status;
	}

	public List<QuestionOptionResponseDTO> getOptions() {
		return options;
	}

	public void setOptions(List<QuestionOptionResponseDTO> options) {
		this.options = options;
	}
}
