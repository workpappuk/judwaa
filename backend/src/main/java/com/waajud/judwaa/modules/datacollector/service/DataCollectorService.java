package com.waajud.judwaa.modules.datacollector.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorDetailResponseDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorPersistedRecordDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorPersistResponseDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorSummaryResponseDTO;
import com.waajud.judwaa.modules.datacollector.entity.DataCollectorState;
import com.waajud.judwaa.modules.datacollector.model.DataCollectorDefinition;
import com.waajud.judwaa.modules.datacollector.repository.DataCollectorStateRepository;
import com.waajud.judwaa.modules.datacollector.seeder.DataCollectorDefinitionSeeder;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.stereotype.Service;

@Service
public class DataCollectorService {

	private final ObjectMapper objectMapper;
	private final DataCollectorStateRepository stateRepository;
	private final Map<String, DataCollectorDefinition> collectorDefinitions;

	public DataCollectorService(ObjectMapper objectMapper, DataCollectorStateRepository stateRepository,
			DataCollectorDefinitionSeeder definitionSeeder) {
		this.objectMapper = objectMapper;
		this.stateRepository = stateRepository;
		this.collectorDefinitions = definitionSeeder.getDefinitions();
	}

	public synchronized List<DataCollectorSummaryResponseDTO> listCollectors() {
		List<DataCollectorSummaryResponseDTO> response = new ArrayList<>();

		for (DataCollectorDefinition definition : collectorDefinitions.values()) {
			String safeCollectorId = Objects.requireNonNull(definition.id());
			DataCollectorState state = stateRepository.findById(safeCollectorId).orElse(null);
			response.add(new DataCollectorSummaryResponseDTO(definition.id(), definition.category(), definition.title(),
					definition.subtitle(), definition.importButtonLabel(), definition.related(),
					state != null && state.getUpdatedAt() != null ? state.getUpdatedAt().toString() : null));
		}

		return response;
	}

	public synchronized DataCollectorDetailResponseDTO getCollector(String collectorId) {
		DataCollectorDefinition definition = collectorDefinitions.get(collectorId);
		if (definition == null) {
			return null;
		}

		String safeCollectorId = Objects.requireNonNull(collectorId);
		DataCollectorState state = stateRepository.findById(safeCollectorId).orElse(null);
		Map<String, Object> persistedValues = state != null ? parseValuesJson(state.getValuesJson()) : Map.of();
		String updatedAt = state != null && state.getUpdatedAt() != null ? state.getUpdatedAt().toString() : null;

		return new DataCollectorDetailResponseDTO(definition.id(), definition.category(), definition.title(),
				definition.subtitle(), definition.importButtonLabel(), definition.related(), definition.steps(),
				definition.links(),
				persistedValues, updatedAt);
	}

	public synchronized List<DataCollectorPersistedRecordDTO> listPersistedCollectorData() {
		List<DataCollectorPersistedRecordDTO> persistedRecords = new ArrayList<>();

		for (DataCollectorState state : stateRepository.findAll()) {
			Map<String, Object> values = parseValuesJson(state.getValuesJson());
			String updatedAt = state.getUpdatedAt() != null ? state.getUpdatedAt().toString() : null;

			persistedRecords.add(new DataCollectorPersistedRecordDTO(state.getCollectorId(), values, updatedAt));
		}

		return persistedRecords;
	}

	public synchronized DataCollectorPersistedRecordDTO getPersistedCollectorData(String collectorId) {
		String safeCollectorId = Objects.requireNonNull(collectorId);
		DataCollectorState state = stateRepository.findById(safeCollectorId).orElse(null);
		if (state == null) {
			return null;
		}

		Map<String, Object> values = parseValuesJson(state.getValuesJson());
		String updatedAt = state.getUpdatedAt() != null ? state.getUpdatedAt().toString() : null;

		return new DataCollectorPersistedRecordDTO(state.getCollectorId(), values, updatedAt);
	}

	public synchronized DataCollectorPersistResponseDTO saveCollectorValues(String collectorId, Map<String, Object> values) {
		DataCollectorDefinition definition = collectorDefinitions.get(collectorId);
		if (definition == null) {
			return null;
		}

		Map<String, Object> sanitizedValues = sanitizeValues(values);
		String safeCollectorId = Objects.requireNonNull(collectorId);
		DataCollectorState state = stateRepository.findById(safeCollectorId).orElseGet(DataCollectorState::new);
		state.setCollectorId(safeCollectorId);
		state.setValuesJson(writeValuesJson(sanitizedValues));
		state = stateRepository.save(state);
		String updatedAt = state.getUpdatedAt() != null ? state.getUpdatedAt().toString() : Instant.now().toString();

		return new DataCollectorPersistResponseDTO("Collector data saved", updatedAt);
	}

	private String writeValuesJson(Map<String, Object> values) {
		try {
			return objectMapper.writeValueAsString(values);
		} catch (Exception ex) {
			throw new RuntimeException("Unable to serialize collector values", ex);
		}
	}

	private Map<String, Object> parseValuesJson(String valuesJson) {
		if (valuesJson == null || valuesJson.isBlank()) {
			return Map.of();
		}

		try {
			return objectMapper.readValue(valuesJson, objectMapper.getTypeFactory()
					.constructMapType(LinkedHashMap.class, String.class, Object.class));
		} catch (Exception ex) {
			return Map.of();
		}
	}

	private Map<String, Object> sanitizeValues(Map<String, Object> values) {
		Map<String, Object> sanitized = new LinkedHashMap<>();
		if (values == null) {
			return sanitized;
		}

		for (Map.Entry<String, Object> entry : values.entrySet()) {
			Object value = entry.getValue();
			if (value instanceof String || value instanceof Number || value instanceof Boolean) {
				sanitized.put(entry.getKey(), value);
			}
		}

		return sanitized;
	}

}
