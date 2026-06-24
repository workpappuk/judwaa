package com.waajud.judwaa.modules.auth.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@MappedSuperclass
public abstract class BaseEntity implements Serializable {
	@Id
	protected UUID id;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at")
	private Instant updatedAt;

	@Column(name = "created_by", nullable = false, updatable = false)
	private String createdBy = "SYSTEM";

	@Column(name = "updated_by")
	private String updatedBy = "SYSTEM";

	public BaseEntity() {
	}

	public BaseEntity(UUID id, Instant createdAt, Instant updatedAt, String createdBy, String updatedBy) {
		this.id = id;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.createdBy = createdBy;
		this.updatedBy = updatedBy;
	}

	@PrePersist
	protected void onCreate() {
		this.createdAt = Instant.now();
		this.updatedAt = Instant.now();
		this.id = UuidCreator.getTimeOrderedEpoch();
		if (this.createdBy == null || this.createdBy.isBlank()) {
			this.createdBy = "SYSTEM";
		}
		if (this.updatedBy == null || this.updatedBy.isBlank()) {
			this.updatedBy = "SYSTEM";
		}
	}

	@PreUpdate
	protected void onUpdate() {
		this.updatedAt = Instant.now();
		if (this.updatedBy == null || this.updatedBy.isBlank()) {
			this.updatedBy = "SYSTEM";
		}
	}

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Instant createdAt) {
		this.createdAt = createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(Instant updatedAt) {
		this.updatedAt = updatedAt;
	}

	public String getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}

	public String getUpdatedBy() {
		return updatedBy;
	}

	public void setUpdatedBy(String updatedBy) {
		this.updatedBy = updatedBy;
	}
}
