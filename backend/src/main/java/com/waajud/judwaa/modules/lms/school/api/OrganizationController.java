package com.waajud.judwaa.modules.lms.school.api;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.lms.school.dto.OrganizationRequestDTO;
import com.waajud.judwaa.modules.lms.school.dto.OrganizationResponseDTO;
import com.waajud.judwaa.modules.lms.school.service.OrganizationService;
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
@RequestMapping("/api/lms/organizations")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE,
		RequestMethod.OPTIONS}, allowedHeaders = "*", exposedHeaders = {"Content-Type", "Authorization"}, maxAge = 3600)
public class OrganizationController {
	private final OrganizationService organizationService;

	public OrganizationController(OrganizationService organizationService) {
		this.organizationService = organizationService;
	}

	@PostMapping
	public ResponseEntity<OrganizationResponseDTO> createOrganization(@RequestBody @Valid OrganizationRequestDTO request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(organizationService.createOrganization(request));
	}

	@PutMapping("/{organizationId}")
	public OrganizationResponseDTO updateOrganization(@PathVariable UUID organizationId,
			@RequestBody @Valid OrganizationRequestDTO request) {
		return organizationService.updateOrganization(organizationId, request);
	}

	@GetMapping("/{organizationId}")
	public OrganizationResponseDTO getOrganization(@PathVariable UUID organizationId) {
		return organizationService.getOrganization(organizationId);
	}

	@GetMapping
	public PaginatedResponseDTO<OrganizationResponseDTO> listOrganizations(@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int size) {
		return organizationService.listOrganizations(page, size);
	}

	@PutMapping("/{organizationId}/deactivate")
	public ResponseEntity<Void> deactivateOrganization(@PathVariable UUID organizationId) {
		organizationService.deactivateOrganization(organizationId);
		return ResponseEntity.noContent().build();
	}

	@PutMapping("/{organizationId}/activate")
	public ResponseEntity<Void> activateOrganization(@PathVariable UUID organizationId) {
		organizationService.activateOrganization(organizationId);
		return ResponseEntity.noContent().build();
	}
}
