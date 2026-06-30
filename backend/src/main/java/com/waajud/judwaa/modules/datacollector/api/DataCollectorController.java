package com.waajud.judwaa.modules.datacollector.api;

import com.waajud.judwaa.modules.datacollector.dto.DataCollectorDetailResponseDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorPersistRequestDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorPersistedRecordDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorPersistResponseDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorSummaryResponseDTO;
import com.waajud.judwaa.modules.datacollector.service.DataCollectorService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/data-collector")
@CrossOrigin(origins = "*", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
		RequestMethod.DELETE, RequestMethod.OPTIONS }, allowedHeaders = "*", exposedHeaders = {
				"Content-Type", "Authorization" }, maxAge = 3600)
public class DataCollectorController {

	private final DataCollectorService dataCollectorService;

	public DataCollectorController(DataCollectorService dataCollectorService) {
		this.dataCollectorService = dataCollectorService;
	}

	@GetMapping
	public List<DataCollectorSummaryResponseDTO> listCollectors() {
		return dataCollectorService.listCollectors();
	}

	@GetMapping("/persisted")
	public List<DataCollectorPersistedRecordDTO> listPersistedCollectorData() {
		return dataCollectorService.listPersistedCollectorData();
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getCollector(@PathVariable String id) {
		DataCollectorDetailResponseDTO response = dataCollectorService.getCollector(id);
		if (response == null) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(response);
	}

	@GetMapping("/{id}/persisted")
	public ResponseEntity<?> getPersistedCollectorData(@PathVariable String id) {
		DataCollectorPersistedRecordDTO response = dataCollectorService.getPersistedCollectorData(id);
		if (response == null) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(response);
	}

	@PutMapping("/{id}/persisted")
	public ResponseEntity<?> updatePersistedCollectorData(@PathVariable String id,
			@RequestBody DataCollectorPersistRequestDTO request) {
		if (request == null || request.values() == null) {
			return ResponseEntity.badRequest().body(Map.of("message", "Invalid values payload"));
		}

		DataCollectorPersistResponseDTO saveResponse = dataCollectorService.saveCollectorValues(id, request.values());
		if (saveResponse == null) {
			return ResponseEntity.notFound().build();
		}

		DataCollectorPersistedRecordDTO persisted = dataCollectorService.getPersistedCollectorData(id);
		if (persisted == null) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(persisted);
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> persistCollector(@PathVariable String id,
			@RequestBody DataCollectorPersistRequestDTO request) {
		if (request == null || request.values() == null) {
			return ResponseEntity.badRequest().body(Map.of("message", "Invalid values payload"));
		}

		DataCollectorPersistResponseDTO response = dataCollectorService.saveCollectorValues(id, request.values());
		if (response == null) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(response);
	}
}
