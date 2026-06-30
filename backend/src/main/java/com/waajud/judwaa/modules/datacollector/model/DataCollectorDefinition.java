package com.waajud.judwaa.modules.datacollector.model;

import com.waajud.judwaa.modules.datacollector.dto.DataCollectorLinkItemDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorRelatedStatsDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorStepItemDTO;
import java.util.List;

public record DataCollectorDefinition(String id, String category, String title, String subtitle,
		String importButtonLabel, DataCollectorRelatedStatsDTO related, List<DataCollectorStepItemDTO> steps,
		List<DataCollectorLinkItemDTO> links) {
}
