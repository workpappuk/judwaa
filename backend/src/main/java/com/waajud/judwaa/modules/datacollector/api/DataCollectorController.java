package com.waajud.judwaa.modules.datacollector.api;

import com.waajud.judwaa.modules.datacollector.dto.DataCollectorDetailResponseDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorPersistRequestDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorPersistedRecordDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorPersistResponseDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorSummaryResponseDTO;
import com.waajud.judwaa.modules.datacollector.service.DataCollectorService;
import com.waajud.judwaa.shared.JudwaaResponse;
import java.util.List;
import org.springframework.http.HttpStatus;
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
	public JudwaaResponse<List<DataCollectorSummaryResponseDTO>, String> listCollectors() {
		return JudwaaResponse.build(dataCollectorService.listCollectors(), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@GetMapping("/persisted")
	public JudwaaResponse<List<DataCollectorPersistedRecordDTO>, String> listPersistedCollectorData() {
		return JudwaaResponse.build(dataCollectorService.listPersistedCollectorData(), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@GetMapping("/{id}")
	public JudwaaResponse<DataCollectorDetailResponseDTO, String> getCollector(@PathVariable String id) {
		DataCollectorDetailResponseDTO response = dataCollectorService.getCollector(id);
		if (response == null) {
			return JudwaaResponse.build(null, HttpStatus.NOT_FOUND.getReasonPhrase(), HttpStatus.NOT_FOUND);
		}

		return JudwaaResponse.build(response, HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@GetMapping("/{id}/persisted")
	public JudwaaResponse<DataCollectorPersistedRecordDTO, String> getPersistedCollectorData(@PathVariable String id) {
		DataCollectorPersistedRecordDTO response = dataCollectorService.getPersistedCollectorData(id);
		if (response == null) {
			return JudwaaResponse.build(null, HttpStatus.NOT_FOUND.getReasonPhrase(), HttpStatus.NOT_FOUND);
		}

		return JudwaaResponse.build(response, HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@PutMapping("/{id}/persisted")
	public JudwaaResponse<Object, String> updatePersistedCollectorData(@PathVariable String id,
			@RequestBody DataCollectorPersistRequestDTO request) {
		if (request == null || request.values() == null) {
			return JudwaaResponse.build(null, "Invalid values payload", HttpStatus.BAD_REQUEST);
		}

		DataCollectorPersistResponseDTO saveResponse = dataCollectorService.saveCollectorValues(id, request.values());
		if (saveResponse == null) {
			return JudwaaResponse.build(null, HttpStatus.NOT_FOUND.getReasonPhrase(), HttpStatus.NOT_FOUND);
		}

		DataCollectorPersistedRecordDTO persisted = dataCollectorService.getPersistedCollectorData(id);
		if (persisted == null) {
			return JudwaaResponse.build(null, HttpStatus.NOT_FOUND.getReasonPhrase(), HttpStatus.NOT_FOUND);
		}

		return JudwaaResponse.build(persisted, HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@PutMapping("/{id}")
	public JudwaaResponse<Object, String> persistCollector(@PathVariable String id,
			@RequestBody DataCollectorPersistRequestDTO request) {
		if (request == null || request.values() == null) {
			return JudwaaResponse.build(null, "Invalid values payload", HttpStatus.BAD_REQUEST);
		}

		DataCollectorPersistResponseDTO response = dataCollectorService.saveCollectorValues(id, request.values());
		if (response == null) {
			return JudwaaResponse.build(null, HttpStatus.NOT_FOUND.getReasonPhrase(), HttpStatus.NOT_FOUND);
		}

		return JudwaaResponse.build(response, HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}
}
