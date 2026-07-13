package com.waajud.judwaa.modules.lms.exam.entity;

import com.waajud.judwaa.shared.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "lms_exam_sections", indexes = {
		@Index(name = "idx_lms_exam_sections_exam", columnList = "exam_id"),
		@Index(name = "idx_lms_exam_sections_exam_order", columnList = "exam_id,display_order", unique = true)})
public class ExamSection extends BaseEntity {
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "exam_id", nullable = false, foreignKey = @ForeignKey(name = "fk_lms_exam_sections_exam"))
	private Exam exam;

	@Column(name = "display_order", nullable = false)
	private Integer displayOrder;

	@Column(nullable = false, length = 200)
	private String title;

	@Column(length = 2000)
	private String description;

	@Column(name = "max_marks")
	private Double maxMarks;

	@OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("displayOrder ASC")
	private List<Question> questions = new ArrayList<>();

	public Exam getExam() {
		return exam;
	}

	public void setExam(Exam exam) {
		this.exam = exam;
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

	public List<Question> getQuestions() {
		return questions;
	}

	public void setQuestions(List<Question> questions) {
		this.questions.clear();
		if (questions == null) {
			return;
		}
		for (Question question : questions) {
			addQuestion(question);
		}
	}

	public void addQuestion(Question question) {
		question.setSection(this);
		this.questions.add(question);
	}
}
