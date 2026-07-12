package com.waajud.judwaa.modules.lms.school.service;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.shared.RecordStatus;
import com.waajud.judwaa.modules.lms.school.dto.SchoolRequestDTO;
import com.waajud.judwaa.modules.lms.school.dto.SchoolResponseDTO;
import com.waajud.judwaa.modules.lms.school.entity.SchoolOrganization;
import com.waajud.judwaa.modules.lms.school.entity.School;
import com.waajud.judwaa.modules.lms.school.repository.SchoolOrganizationRepository;
import com.waajud.judwaa.modules.lms.school.repository.SchoolRepository;

import java.util.Collections;
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
public class SchoolService {
	private final SchoolRepository schoolRepository;
	private final SchoolOrganizationRepository schoolOrganizationRepository;

	public SchoolService(SchoolRepository schoolRepository, SchoolOrganizationRepository organizationRepository) {
		this.schoolRepository = schoolRepository;
		this.schoolOrganizationRepository = organizationRepository;
	}

	@Transactional
	public SchoolResponseDTO createSchool(SchoolRequestDTO request) {
		SchoolOrganization organization = getOrganizationOrThrow(request.getOrganizationId());
		String normalizedCode = normalizeRequired(request.getCode(), "School code is required");
		if (schoolRepository.existsByOrganizationIdAndCode(organization.getId(), normalizedCode)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "School code already exists in organization");
		}

		School school = new School();
		school.setOrganization(organization);
		applyRequest(school, request, normalizedCode);
		return toResponse(schoolRepository.save(school));
	}

	@Transactional
	public SchoolResponseDTO updateSchool(UUID schoolId, SchoolRequestDTO request) {
		School school = getSchoolOrThrow(schoolId);
		if (!school.getOrganization().getId().equals(request.getOrganizationId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot move school across organizations");
		}

		String normalizedCode = normalizeRequired(request.getCode(), "School code is required");
		if (schoolRepository.existsByOrganizationIdAndCodeAndIdNot(request.getOrganizationId(), normalizedCode, schoolId)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "School code already exists in organization");
		}

		applyRequest(school, request, normalizedCode);
		return toResponse(schoolRepository.save(school));
	}

	@Transactional(readOnly = true)
	public SchoolResponseDTO getSchool(UUID schoolId) {
		return toResponse(getSchoolOrThrow(schoolId));
	}

	@Transactional(readOnly = true)
	public PaginatedResponseDTO<SchoolResponseDTO> listSchools(UUID organizationId, int page, int size) {
		Pageable pageable = PageRequest.of(normalizePage(page), normalizeSize(size),
				Sort.by(Sort.Direction.ASC, "name"));
		Page<School> pageData = organizationId == null ? schoolRepository.findAll(pageable)
				: schoolRepository.findByOrganizationId(organizationId, pageable);
		return PaginatedResponseDTO.fromPage(pageData.map(this::toResponse));
	}

	@Transactional
	public void deactivateSchool(UUID schoolId) {
		School school = getSchoolOrThrow(schoolId);
		school.setStatus(RecordStatus.INACTIVE);
		schoolRepository.save(school);
	}

	@Transactional
	public void activateSchool(UUID schoolId) {
		School school = getSchoolOrThrow(schoolId);
		school.setStatus(RecordStatus.ACTIVE);
		schoolRepository.save(school);
	}

	private void applyRequest(School school, SchoolRequestDTO request, String normalizedCode) {
		school.setCode(normalizedCode);
		school.setName(normalizeRequired(request.getName(), "School name is required"));
		school.setBoards(request.getBoards());
		school.setAddressLine1(trimToNull(request.getAddressLine1()));
		school.setAddressLine2(trimToNull(request.getAddressLine2()));
		school.setCity(trimToNull(request.getCity()));
		school.setState(trimToNull(request.getState()));
		school.setCountry(trimToNull(request.getCountry()));
		school.setPincode(trimToNull(request.getPincode()));
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

	private School getSchoolOrThrow(UUID schoolId) {
		UUID safeSchoolId = Objects.requireNonNull(schoolId, "schoolId is required");
		return schoolRepository.findById(safeSchoolId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "School not found"));
	}

	private SchoolOrganization getOrganizationOrThrow(UUID organizationId) {
		UUID safeOrgId = Objects.requireNonNull(organizationId, "organizationId is required");
		return schoolOrganizationRepository.findById(safeOrgId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
	}

	private SchoolResponseDTO toResponse(School school) {
		SchoolResponseDTO dto = new SchoolResponseDTO();
		dto.setId(school.getId());
		dto.setOrganizationId(school.getOrganization().getId());
		dto.setCode(school.getCode());
		dto.setName(school.getName());
		dto.setBoards(school.getBoards());
		dto.setAddressLine1(school.getAddressLine1());
		dto.setAddressLine2(school.getAddressLine2());
		dto.setCity(school.getCity());
		dto.setState(school.getState());
		dto.setCountry(school.getCountry());
		dto.setPincode(school.getPincode());
		dto.setStatus(school.getStatus());
		return dto;
	}

	private int normalizePage(int page) {
		return Math.max(0, page - 1);
	}

	private int normalizeSize(int size) {
		return Math.min(200, Math.max(1, size));
	}
}
