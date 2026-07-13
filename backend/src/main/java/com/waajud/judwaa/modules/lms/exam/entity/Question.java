package com.waajud.judwaa.modules.lms.exam.entity;

import com.waajud.judwaa.shared.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lms_questions", indexes = {
		@Index(name = "idx_lms_questions_section", columnList = "section_id"),
		@Index(name = "idx_lms_questions_section_order", columnList = "section_id,display_order", unique = true)})
public class Question extends BaseEntity {
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "section_id", nullable = false, foreignKey = @ForeignKey(name = "fk_lms_questions_section"))
	private ExamSection section;

	@Column(name = "display_order", nullable = false)
	private Integer displayOrder;

	@Enumerated(EnumType.STRING)
	@Column(name = "question_type", nullable = false, length = 40)
	private QuestionType questionType;

	@Column(name = "question_text", nullable = false, length = 4000)
	private String questionText;

	@Column(nullable = false)
	private Double marks;

	@Column(nullable = false)
	private boolean mandatory = true;

	@Column(length = 4000)
	private String explanation;

	@OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("displayOrder ASC")
	private List<QuestionOption> options = new ArrayList<>();

	public ExamSection getSection() {
		return section;
	}

	public void setSection(ExamSection section) {
		this.section = section;
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

	public List<QuestionOption> getOptions() {
		return options;
	}

	public void setOptions(List<QuestionOption> options) {
		this.options.clear();
		if (options == null) {
			return;
		}
		for (QuestionOption option : options) {
			addOption(option);
		}
	}

	public void addOption(QuestionOption option) {
		option.setQuestion(this);
		this.options.add(option);
	}
}
