package com.waajud.judwaa.modules.lms.exam.entity;

import com.waajud.judwaa.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "lms_question_options", indexes = {
		@Index(name = "idx_lms_question_options_question", columnList = "question_id"),
		@Index(name = "idx_lms_question_options_question_order", columnList = "question_id,display_order", unique = true)})
public class QuestionOption extends BaseEntity {
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "question_id", nullable = false, foreignKey = @ForeignKey(name = "fk_lms_question_options_question"))
	private Question question;

	@Column(name = "display_order", nullable = false)
	private Integer displayOrder;

	@Column(name = "option_text", nullable = false, length = 2000)
	private String optionText;

	@Column(name = "is_correct", nullable = false)
	private boolean correct;

	public Question getQuestion() {
		return question;
	}

	public void setQuestion(Question question) {
		this.question = question;
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
}
