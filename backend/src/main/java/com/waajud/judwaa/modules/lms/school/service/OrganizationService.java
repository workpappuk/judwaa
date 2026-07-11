package com.waajud.judwaa.modules.lms.school.service;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.shared.RecordStatus;
import com.waajud.judwaa.modules.lms.school.dto.OrganizationRequestDTO;
import com.waajud.judwaa.modules.lms.school.dto.OrganizationResponseDTO;
import com.waajud.judwaa.modules.lms.school.entity.SchoolOrganization;
import com.waajud.judwaa.modules.lms.school.repository.SchoolOrganizationRepository;
import java.util.Objects;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrganizationService {
	private final SchoolOrganizationRepository schoolOrganizationRepository;

	public OrganizationService(SchoolOrganizationRepository organizationRepository) {
		this.schoolOrganizationRepository = organizationRepository;
	}

	@Transactional
	public OrganizationResponseDTO createOrganization(OrganizationRequestDTO request) {
		String normalizedCode = normalizeRequired(request.getCode(), "Organization code is required");
		if (schoolOrganizationRepository.existsByCode(normalizedCode)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Organization code already exists");
		}

		SchoolOrganization organization = new SchoolOrganization();
		applyRequest(organization, request, normalizedCode);
		return toResponse(schoolOrganizationRepository.save(organization));
	}

	@Transactional
	public OrganizationResponseDTO updateOrganization(UUID organizationId, OrganizationRequestDTO request) {
		SchoolOrganization organization = getOrganizationOrThrow(organizationId);
		String normalizedCode = normalizeRequired(request.getCode(), "Organization code is required");
		if (schoolOrganizationRepository.existsByCodeAndIdNot(normalizedCode, organizationId)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Organization code already exists");
		}

		applyRequest(organization, request, normalizedCode);
		return toResponse(schoolOrganizationRepository.save(organization));
	}

	@Transactional(readOnly = true)
	public OrganizationResponseDTO getOrganization(UUID organizationId) {
		return toResponse(getOrganizationOrThrow(organizationId));
	}

	@Transactional(readOnly = true)
	public PaginatedResponseDTO<OrganizationResponseDTO> listOrganizations(int page, int size) {
		Pageable pageable = PageRequest.of(normalizePage(page), normalizeSize(size), Sort.by(Sort.Direction.ASC, "name"));
		Page<SchoolOrganization> pageData = schoolOrganizationRepository.findAll(pageable);
		return PaginatedResponseDTO.fromPage(pageData.map(this::toResponse));
	}

	@Transactional
	public void deactivateOrganization(UUID organizationId) {
		SchoolOrganization organization = getOrganizationOrThrow(organizationId);
		organization.setStatus(RecordStatus.INACTIVE);
		schoolOrganizationRepository.save(organization);
	}

	@Transactional
	public void activateOrganization(UUID organizationId) {
		SchoolOrganization organization = getOrganizationOrThrow(organizationId);
		organization.setStatus(RecordStatus.ACTIVE);
		schoolOrganizationRepository.save(organization);
	}

	private SchoolOrganization getOrganizationOrThrow(UUID organizationId) {
		UUID safeId = Objects.requireNonNull(organizationId, "organizationId is required");
		return schoolOrganizationRepository.findById(safeId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
	}

	private void applyRequest(SchoolOrganization organization, OrganizationRequestDTO request, String normalizedCode) {
		organization.setCode(normalizedCode);
		organization.setName(normalizeRequired(request.getName(), "Organization name is required"));
		organization.setContactEmail(trimToNull(request.getContactEmail()));
		organization.setContactPhone(trimToNull(request.getContactPhone()));
		organization.setAddressLine1(trimToNull(request.getAddressLine1()));
		organization.setAddressLine2(trimToNull(request.getAddressLine2()));
		organization.setCity(trimToNull(request.getCity()));
		organization.setState(trimToNull(request.getState()));
		organization.setCountry(trimToNull(request.getCountry()));
		organization.setPincode(trimToNull(request.getPincode()));
	}

	private OrganizationResponseDTO toResponse(SchoolOrganization organization) {
		OrganizationResponseDTO dto = new OrganizationResponseDTO();
		dto.setId(organization.getId());
		dto.setCode(organization.getCode());
		dto.setName(organization.getName());
		dto.setStatus(organization.getStatus());
		dto.setContactEmail(organization.getContactEmail());
		dto.setContactPhone(organization.getContactPhone());
		dto.setAddressLine1(organization.getAddressLine1());
		dto.setAddressLine2(organization.getAddressLine2());
		dto.setCity(organization.getCity());
		dto.setState(organization.getState());
		dto.setCountry(organization.getCountry());
		dto.setPincode(organization.getPincode());
		return dto;
	}

	private String normalizeRequired(String value, String message) {
		if (value == null || value.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
		}
		return value.trim();
	}

	private String trimToNull(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	private int normalizePage(int page) {
		return Math.max(0, page - 1);
	}

	private int normalizeSize(int size) {
		return Math.min(200, Math.max(1, size));
	}
}
