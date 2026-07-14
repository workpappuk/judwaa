package com.waajud.judwaa.modules.lms.exam.entity;

import com.waajud.judwaa.modules.lms.school.entity.School;
import com.waajud.judwaa.modules.lms.school.entity.SchoolOrganization;
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
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lms_exams", indexes = {
		@Index(name = "idx_lms_exams_org", columnList = "organization_id"),
		@Index(name = "idx_lms_exams_school", columnList = "school_id"),
		@Index(name = "idx_lms_exams_org_code", columnList = "organization_id,code", unique = true),
		@Index(name = "idx_lms_exams_type", columnList = "exam_type")})
public class Exam extends BaseEntity {
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "organization_id", nullable = false, foreignKey = @ForeignKey(name = "fk_lms_exams_org"))
	private SchoolOrganization organization;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "school_id", foreignKey = @ForeignKey(name = "fk_lms_exams_school"))
	private School school;

	@Column(nullable = false, length = 50)
	private String code;

	@Column(nullable = false, length = 200)
	private String title;

	@Column(length = 2000)
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(name = "exam_type", nullable = false, length = 40)
	private ExamType examType;

	@Column(name = "starts_at")
	private Instant startsAt;

	@Column(name = "ends_at")
	private Instant endsAt;

	@Column(name = "duration_minutes")
	private Integer durationMinutes;

	@Column(name = "total_marks")
	private Double totalMarks;

	@OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("displayOrder ASC")
	private List<ExamSection> sections = new ArrayList<>();

	public SchoolOrganization getOrganization() {
		return organization;
	}

	public void setOrganization(SchoolOrganization organization) {
		this.organization = organization;
	}

	public School getSchool() {
		return school;
	}

	public void setSchool(School school) {
		this.school = school;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
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

	public ExamType getExamType() {
		return examType;
	}

	public void setExamType(ExamType examType) {
		this.examType = examType;
	}

	public Instant getStartsAt() {
		return startsAt;
	}

	public void setStartsAt(Instant startsAt) {
		this.startsAt = startsAt;
	}

	public Instant getEndsAt() {
		return endsAt;
	}

	public void setEndsAt(Instant endsAt) {
		this.endsAt = endsAt;
	}

	public Integer getDurationMinutes() {
		return durationMinutes;
	}

	public void setDurationMinutes(Integer durationMinutes) {
		this.durationMinutes = durationMinutes;
	}

	public Double getTotalMarks() {
		return totalMarks;
	}

	public void setTotalMarks(Double totalMarks) {
		this.totalMarks = totalMarks;
	}

	public List<ExamSection> getSections() {
		return sections;
	}

	public void setSections(List<ExamSection> sections) {
		this.sections.clear();
		if (sections == null) {
			return;
		}
		for (ExamSection section : sections) {
			addSection(section);
		}
	}

	public void addSection(ExamSection section) {
		section.setExam(this);
		this.sections.add(section);
	}
}
