package com.waajud.judwaa.modules.lms.exam.dto;

import com.waajud.judwaa.modules.lms.exam.entity.ExamType;
import com.waajud.judwaa.shared.RecordStatus;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ExamResponseDTO {
	private UUID id;
	private UUID organizationId;
	private UUID schoolId;
	private String code;
	private String title;
	private String description;
	private ExamType examType;
	private Instant startsAt;
	private Instant endsAt;
	private Integer durationMinutes;
	private Double totalMarks;
	private RecordStatus status;
	private List<ExamSectionResponseDTO> sections = new ArrayList<>();

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public UUID getOrganizationId() {
		return organizationId;
	}

	public void setOrganizationId(UUID organizationId) {
		this.organizationId = organizationId;
	}

	public UUID getSchoolId() {
		return schoolId;
	}

	public void setSchoolId(UUID schoolId) {
		this.schoolId = schoolId;
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

	public RecordStatus getStatus() {
		return status;
	}

	public void setStatus(RecordStatus status) {
		this.status = status;
	}

	public List<ExamSectionResponseDTO> getSections() {
		return sections;
	}

	public void setSections(List<ExamSectionResponseDTO> sections) {
		this.sections = sections;
	}
}
