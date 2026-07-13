package com.waajud.judwaa.modules.lms.exam.dto;

import com.waajud.judwaa.shared.RecordStatus;
import java.util.UUID;

public class QuestionOptionResponseDTO {
	private UUID id;
	private Integer displayOrder;
	private String optionText;
	private boolean correct;
	private RecordStatus status;

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

	public String getOptionText() {
		return optionText;
	}

	public void setOptionText(String optionText) {
		this.optionText = optionText;
	}

	public boolean isCorrect() {
		return correct;
	}

	public void setCorrect(boolean correct) {
		this.correct = correct;
	}

	public RecordStatus getStatus() {
		return status;
	}

	public void setStatus(RecordStatus status) {
		this.status = status;
	}
}
