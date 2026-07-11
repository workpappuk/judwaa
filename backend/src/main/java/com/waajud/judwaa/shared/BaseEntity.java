package com.waajud.judwaa.shared;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.ColumnDefault;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

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

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 200)
	@ColumnDefault("'ACTIVE'")
	private RecordStatus status;

	public BaseEntity() {
	}

	public BaseEntity(UUID id, Instant createdAt, Instant updatedAt, String createdBy, String updatedBy, RecordStatus status) {
		this.id = id;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.createdBy = createdBy;
		this.updatedBy = updatedBy;
		this.status = status;
	}

	@PrePersist
	protected void onCreate() {
		this.createdAt = Instant.now();
		this.updatedAt = Instant.now();
		this.id = UuidCreator.getTimeOrderedEpoch();
		String actor = resolveActor();
		if (this.createdBy == null || this.createdBy.isEmpty()) {
			this.createdBy = actor;
		}
		if (this.updatedBy == null || this.updatedBy.isEmpty()) {
			this.updatedBy = actor;
		}
		if (this.status == null) {
			this.status = RecordStatus.ACTIVE;
		}
	}

	@PreUpdate
	protected void onUpdate() {
		this.updatedAt = Instant.now();
		this.updatedBy = resolveActor();
	}

	private String resolveActor() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()) {
			return "SYSTEM";
		}

		String name = authentication.getName();
		if (name == null || name.isEmpty() || "anonymousUser".equalsIgnoreCase(name)) {
			return "SYSTEM";
		}

		return name;
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

	public RecordStatus getStatus() {
		return status;
	}

	public void setStatus(RecordStatus status) {
		this.status = status;
	}
}
