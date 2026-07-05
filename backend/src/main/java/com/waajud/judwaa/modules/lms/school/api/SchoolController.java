package com.waajud.judwaa.modules.lms.school.api;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.lms.school.dto.SchoolRequestDTO;
import com.waajud.judwaa.modules.lms.school.dto.SchoolResponseDTO;
import com.waajud.judwaa.modules.lms.school.service.SchoolService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lms/schools")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE,
		RequestMethod.OPTIONS}, allowedHeaders = "*", exposedHeaders = {"Content-Type", "Authorization"}, maxAge = 3600)
public class SchoolController {
	private final SchoolService schoolService;

	public SchoolController(SchoolService schoolService) {
		this.schoolService = schoolService;
	}

	@PostMapping
	public ResponseEntity<SchoolResponseDTO> createSchool(@RequestBody @Valid SchoolRequestDTO request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(schoolService.createSchool(request));
	}

	@PutMapping("/{schoolId}")
	public SchoolResponseDTO updateSchool(@PathVariable UUID schoolId, @RequestBody @Valid SchoolRequestDTO request) {
		return schoolService.updateSchool(schoolId, request);
	}

	@GetMapping("/{schoolId}")
	public SchoolResponseDTO getSchool(@PathVariable UUID schoolId) {
		return schoolService.getSchool(schoolId);
	}

	@GetMapping
	public PaginatedResponseDTO<SchoolResponseDTO> listSchools(@RequestParam(required = false) UUID organizationId,
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size) {
		return schoolService.listSchools(organizationId, page, size);
	}

	@PutMapping("/{schoolId}/deactivate")
	public ResponseEntity<Void> deactivateSchool(@PathVariable UUID schoolId) {
		schoolService.deactivateSchool(schoolId);
		return ResponseEntity.noContent().build();
	}

	@PutMapping("/{schoolId}/activate")
	public ResponseEntity<Void> activateSchool(@PathVariable UUID schoolId) {
		schoolService.activateSchool(schoolId);
		return ResponseEntity.noContent().build();
	}
}
