package com.waajud.judwaa.modules.lms.school.entity;

import com.waajud.judwaa.modules.auth.entity.BaseEntity;
import com.waajud.judwaa.modules.lms.common.enums.RecordStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "subjects", indexes = {
		@Index(name = "idx_subjects_classroom", columnList = "classroom_id"),
		@Index(name = "idx_subjects_classroom_code", columnList = "classroom_id,code", unique = true)})
public class Subject extends BaseEntity {
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "classroom_id", nullable = false, foreignKey = @ForeignKey(name = "fk_subjects_classroom"))
	private Classroom classroom;

	@Column(nullable = false, length = 40)
	private String code;

	@Column(nullable = false, length = 150)
	private String name;

	@Column(name = "max_marks")
	private Double maxMarks;

	@Column(name = "pass_marks")
	private Double passMarks;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private RecordStatus status = RecordStatus.ACTIVE;

	public Classroom getClassroom() {
		return classroom;
	}

	public void setClassroom(Classroom classroom) {
		this.classroom = classroom;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Double getMaxMarks() {
		return maxMarks;
	}

	public void setMaxMarks(Double maxMarks) {
		this.maxMarks = maxMarks;
	}

	public Double getPassMarks() {
		return passMarks;
	}

	public void setPassMarks(Double passMarks) {
		this.passMarks = passMarks;
	}

	public RecordStatus getStatus() {
		return status;
	}

	public void setStatus(RecordStatus status) {
		this.status = status;
	}
}
