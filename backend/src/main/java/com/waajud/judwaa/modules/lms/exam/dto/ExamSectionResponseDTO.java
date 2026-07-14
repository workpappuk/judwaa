package com.waajud.judwaa.modules.lms.exam.dto;

import com.waajud.judwaa.shared.RecordStatus;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ExamSectionResponseDTO {
	private UUID id;
	private Integer displayOrder;
	private String title;
	private String description;
	private Double maxMarks;
	private RecordStatus status;
	private List<QuestionResponseDTO> questions = new ArrayList<>();

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

	public RecordStatus getStatus() {
		return status;
	}

	public void setStatus(RecordStatus status) {
		this.status = status;
	}

	public List<QuestionResponseDTO> getQuestions() {
		return questions;
	}

	public void setQuestions(List<QuestionResponseDTO> questions) {
		this.questions = questions;
	}
}
