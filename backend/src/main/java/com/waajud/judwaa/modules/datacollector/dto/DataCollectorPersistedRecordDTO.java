package com.waajud.judwaa.modules.datacollector.dto;

import java.util.Map;

public record DataCollectorPersistedRecordDTO(String collectorId, Map<String, Object> values, String updatedAt) {
}
