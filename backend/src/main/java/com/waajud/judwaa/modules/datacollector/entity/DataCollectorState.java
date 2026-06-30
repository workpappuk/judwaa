package com.waajud.judwaa.modules.datacollector.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "data_collector_states")
public class DataCollectorState {
	@Id
	@Column(name = "collector_id", nullable = false, length = 120)
	private String collectorId;

	@Lob
	@Column(name = "values_json", nullable = false)
	private String valuesJson = "{}";

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@PrePersist
	@PreUpdate
	protected void touchTimestamp() {
		updatedAt = Instant.now();
	}

	public String getCollectorId() {
		return collectorId;
	}

	public void setCollectorId(String collectorId) {
		this.collectorId = collectorId;
	}

	public String getValuesJson() {
		return valuesJson;
	}

	public void setValuesJson(String valuesJson) {
		this.valuesJson = valuesJson;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(Instant updatedAt) {
		this.updatedAt = updatedAt;
	}
}
