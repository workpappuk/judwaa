package com.waajud.judwaa.modules.lms.school.api;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.lms.school.dto.SchoolRequestDTO;
import com.waajud.judwaa.modules.lms.school.dto.SchoolResponseDTO;
import com.waajud.judwaa.modules.lms.school.service.SchoolService;
import com.waajud.judwaa.shared.JudwaaResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
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
	public JudwaaResponse<SchoolResponseDTO, String> createSchool(@RequestBody @Valid SchoolRequestDTO request) {
		return JudwaaResponse.build(schoolService.createSchool(request), HttpStatus.CREATED.getReasonPhrase(), HttpStatus.CREATED);
	}

	@PutMapping("/{schoolId}")
	public JudwaaResponse<SchoolResponseDTO, String> updateSchool(@PathVariable UUID schoolId, @RequestBody @Valid SchoolRequestDTO request) {
		return JudwaaResponse.build(schoolService.updateSchool(schoolId, request), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@GetMapping("/{schoolId}")
	public JudwaaResponse<SchoolResponseDTO, String> getSchool(@PathVariable UUID schoolId) {
		return JudwaaResponse.build(schoolService.getSchool(schoolId), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@GetMapping
	public JudwaaResponse<PaginatedResponseDTO<SchoolResponseDTO>, String> listSchools(@RequestParam(required = false) UUID organizationId,
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size) {
		return JudwaaResponse.build(schoolService.listSchools(organizationId, page, size), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@PutMapping("/{schoolId}/deactivate")
	public JudwaaResponse<Object, String> deactivateSchool(@PathVariable UUID schoolId) {
		schoolService.deactivateSchool(schoolId);
		return JudwaaResponse.build(null, "School deactivated", HttpStatus.OK);
	}

	@PutMapping("/{schoolId}/activate")
	public JudwaaResponse<Object, String> activateSchool(@PathVariable UUID schoolId) {
		schoolService.activateSchool(schoolId);
		return JudwaaResponse.build(null, "School activated", HttpStatus.OK);
	}
}
