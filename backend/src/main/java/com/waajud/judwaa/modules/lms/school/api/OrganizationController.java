package com.waajud.judwaa.modules.lms.school.api;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.lms.school.dto.OrganizationRequestDTO;
import com.waajud.judwaa.modules.lms.school.dto.OrganizationResponseDTO;
import com.waajud.judwaa.modules.lms.school.service.OrganizationService;
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
@RequestMapping("/api/lms/organizations")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE,
		RequestMethod.OPTIONS}, allowedHeaders = "*", exposedHeaders = {"Content-Type", "Authorization"}, maxAge = 3600)
public class OrganizationController {
	private final OrganizationService organizationService;

	public OrganizationController(OrganizationService organizationService) {
		this.organizationService = organizationService;
	}

	@PostMapping
	public JudwaaResponse<OrganizationResponseDTO, String> createOrganization(@RequestBody @Valid OrganizationRequestDTO request) {
		return JudwaaResponse.build(organizationService.createOrganization(request), HttpStatus.CREATED.getReasonPhrase(), HttpStatus.CREATED);
	}

	@PutMapping("/{organizationId}")
	public JudwaaResponse<OrganizationResponseDTO, String> updateOrganization(@PathVariable UUID organizationId,
			@RequestBody @Valid OrganizationRequestDTO request) {
		return JudwaaResponse.build(organizationService.updateOrganization(organizationId, request), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@GetMapping("/{organizationId}")
	public JudwaaResponse<OrganizationResponseDTO, String> getOrganization(@PathVariable UUID organizationId) {
		return JudwaaResponse.build(organizationService.getOrganization(organizationId), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@GetMapping
	public JudwaaResponse<PaginatedResponseDTO<OrganizationResponseDTO>, String> listOrganizations(@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int size) {
		return JudwaaResponse.build(organizationService.listOrganizations(page, size), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@PutMapping("/{organizationId}/deactivate")
	public JudwaaResponse<Object, String> deactivateOrganization(@PathVariable UUID organizationId) {
		organizationService.deactivateOrganization(organizationId);
		return JudwaaResponse.build(null, "Organization deactivated", HttpStatus.OK);
	}

	@PutMapping("/{organizationId}/activate")
	public JudwaaResponse<Object, String> activateOrganization(@PathVariable UUID organizationId) {
		organizationService.activateOrganization(organizationId);
		return JudwaaResponse.build(null, "Organization activated", HttpStatus.OK);
	}
}
