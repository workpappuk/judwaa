package com.waajud.judwaa.modules.lms.common.entity;

import com.waajud.judwaa.modules.auth.entity.BaseEntity;
import com.waajud.judwaa.modules.lms.common.enums.RecordStatus;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class LmsBaseEntity extends BaseEntity {
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private RecordStatus status = RecordStatus.ACTIVE;

	public RecordStatus getStatus() {
		return status;
	}

	public void setStatus(RecordStatus status) {
		this.status = status;
	}
}
