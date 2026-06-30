package com.waajud.judwaa.modules.datacollector.seeder;

import com.waajud.judwaa.modules.datacollector.dto.DataCollectorLinkItemDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorRelatedStatsDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorStepItemDTO;
import com.waajud.judwaa.modules.datacollector.model.DataCollectorDefinition;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class DataCollectorDefinitionSeeder {

	private final Map<String, DataCollectorDefinition> definitions;

	public DataCollectorDefinitionSeeder() {
		this.definitions = seedDefinitions();
	}

	public Map<String, DataCollectorDefinition> getDefinitions() {
		return definitions;
	}

	private Map<String, DataCollectorDefinition> seedDefinitions() {
		Map<String, DataCollectorDefinition> seeded = new LinkedHashMap<>();
		List<DataCollectorStepItemDTO> commonSteps = buildCommonSteps();
		List<DataCollectorLinkItemDTO> commonLinks = buildCommonLinks();

		seeded.put("tenant-onboarding",
				new DataCollectorDefinition("tenant-onboarding", "ONBOARDING", "Tenant Onboarding Data",
						"Collect and validate new tenant onboarding records across identity, billing, and access setup.",
						"Import Tenant Onboarding Config", new DataCollectorRelatedStatsDTO(4, 8, 116, 104), commonSteps,
						commonLinks));

		seeded.put("equity-daily",
				new DataCollectorDefinition("equity-daily", "EQUITY", "Daily Equity Snapshot",
						"Collect end-of-day equity market records in a scheduled batch.", "Import Equity Config",
						new DataCollectorRelatedStatsDTO(4, 8, 116, 104), commonSteps, commonLinks));

		seeded.put("fo-intraday",
				new DataCollectorDefinition("fo-intraday", "F&O", "F&O Intraday Feed",
						"Stream and validate derivative contracts for intraday analytics.", "Import F&O Config",
						new DataCollectorRelatedStatsDTO(4, 8, 116, 104), commonSteps, commonLinks));

		seeded.put("client-master",
				new DataCollectorDefinition("client-master", "MASTER", "Client Master Sync",
						"Synchronize client and account master data from upstream systems.", "Import Master Config",
						new DataCollectorRelatedStatsDTO(4, 8, 116, 104), commonSteps, commonLinks));

		return seeded;
	}

	private List<DataCollectorStepItemDTO> buildCommonSteps() {
		return List.of(new DataCollectorStepItemDTO("source", "Source Setup", "Choose source and schedule details"),
				new DataCollectorStepItemDTO("mapping", "Field Mapping", "Map incoming fields to internal schema"),
				new DataCollectorStepItemDTO("validation", "Validation Rules", "Define quality and integrity checks"),
				new DataCollectorStepItemDTO("review", "Review & Run", "Confirm settings and start collection"));
	}

	private List<DataCollectorLinkItemDTO> buildCommonLinks() {
		return List.of(new DataCollectorLinkItemDTO("Incentive Module", "/incentive", false),
				new DataCollectorLinkItemDTO("Trading Dashboard", "/trading/f&o", false),
				new DataCollectorLinkItemDTO("Instrument Library", "/trading/instrument", false),
				new DataCollectorLinkItemDTO("Collector Logging Guide",
						"https://docs.python.org/3/library/logging.html", true));
	}
}
