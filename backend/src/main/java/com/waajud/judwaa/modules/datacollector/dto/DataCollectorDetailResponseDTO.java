package com.waajud.judwaa.modules.datacollector.dto;

import java.util.List;
import java.util.Map;

public record DataCollectorDetailResponseDTO(String id, String category, String title, String subtitle,
		String importButtonLabel, DataCollectorRelatedStatsDTO related, List<DataCollectorStepItemDTO> steps,
		List<DataCollectorLinkItemDTO> links, Map<String, Object> persistedValues,
		String updatedAt) {
}
