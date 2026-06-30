package com.waajud.judwaa.modules.datacollector.dto;

public record DataCollectorSummaryResponseDTO(String id, String category, String title, String subtitle,
		String importButtonLabel, DataCollectorRelatedStatsDTO related, String updatedAt) {
}
