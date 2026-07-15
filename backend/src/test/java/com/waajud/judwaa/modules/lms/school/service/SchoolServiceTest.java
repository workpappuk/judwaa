package com.waajud.judwaa.modules.lms.school.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.lms.school.dto.SchoolRequestDTO;
import com.waajud.judwaa.modules.lms.school.dto.SchoolResponseDTO;
import com.waajud.judwaa.modules.lms.school.entity.School;
import com.waajud.judwaa.modules.lms.school.entity.SchoolOrganization;
import com.waajud.judwaa.modules.lms.school.repository.SchoolOrganizationRepository;
import com.waajud.judwaa.modules.lms.school.repository.SchoolRepository;
import com.waajud.judwaa.shared.RecordStatus;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class SchoolServiceTest {

	@Mock
	private SchoolRepository schoolRepository;

	@Mock
	private SchoolOrganizationRepository organizationRepository;

	@InjectMocks
	private SchoolService service;

	private SchoolRequestDTO request;
	private UUID organizationId;

	@BeforeEach
	void setUp() {
		organizationId = UUID.randomUUID();
		request = new SchoolRequestDTO();
		request.setOrganizationId(organizationId);
		request.setCode("SCH-001");
		request.setName("Sunrise School");
		request.setBoards(Set.of("CBSE"));
	}

	@Test
	void createSchool_success() {
		SchoolOrganization organization = new SchoolOrganization();
		organization.setId(organizationId);
		when(organizationRepository.findById(organizationId)).thenReturn(Optional.of(organization));
		when(schoolRepository.existsByOrganizationIdAndCode(organizationId, "SCH-001")).thenReturn(false);
		when(schoolRepository.save(any(School.class))).thenAnswer(invocation -> {
			School school = invocation.getArgument(0);
			school.setId(UUID.randomUUID());
			school.setStatus(RecordStatus.ACTIVE);
			return school;
		});

		SchoolResponseDTO response = service.createSchool(request);

		assertEquals("SCH-001", response.getCode());
		assertEquals("Sunrise School", response.getName());
		assertEquals(organizationId, response.getOrganizationId());
	}

	@Test
	void createSchool_duplicateCode_throwsConflict() {
		SchoolOrganization organization = new SchoolOrganization();
		organization.setId(organizationId);
		when(organizationRepository.findById(organizationId)).thenReturn(Optional.of(organization));
		when(schoolRepository.existsByOrganizationIdAndCode(organizationId, "SCH-001")).thenReturn(true);

		ResponseStatusException exception = assertThrows(ResponseStatusException.class,
				() -> service.createSchool(request));

		assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
	}

	@Test
	void updateSchool_crossOrganizationMove_throwsBadRequest() {
		UUID schoolId = UUID.randomUUID();
		SchoolOrganization originalOrg = new SchoolOrganization();
		originalOrg.setId(UUID.randomUUID());
		School school = new School();
		school.setId(schoolId);
		school.setOrganization(originalOrg);
		when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));

		ResponseStatusException exception = assertThrows(ResponseStatusException.class,
				() -> service.updateSchool(schoolId, request));

		assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
	}

	@Test
	void listSchools_returnsPage() {
		SchoolOrganization organization = new SchoolOrganization();
		organization.setId(organizationId);
		School school = new School();
		school.setId(UUID.randomUUID());
		school.setOrganization(organization);
		school.setCode("SCH-001");
		school.setName("Sunrise School");
		Page<School> page = new PageImpl<>(java.util.List.of(school));
		when(schoolRepository.findByOrganizationId(any(UUID.class), any(org.springframework.data.domain.Pageable.class))).thenReturn(page);

		PaginatedResponseDTO<SchoolResponseDTO> response = service.listSchools(organizationId, 1, 10);

		assertEquals(1, response.getContent().size());
		assertEquals("SCH-001", response.getContent().get(0).getCode());
	}

	@Test
	void listSchools_withoutOrganizationFilter_usesFindAll() {
		SchoolOrganization organization = new SchoolOrganization();
		organization.setId(organizationId);
		School school = new School();
		school.setId(UUID.randomUUID());
		school.setOrganization(organization);
		school.setCode("SCH-ALL");
		school.setName("All School");
		Page<School> page = new PageImpl<>(java.util.List.of(school));
		when(schoolRepository.findAll(any(org.springframework.data.domain.Pageable.class))).thenReturn(page);

		PaginatedResponseDTO<SchoolResponseDTO> response = service.listSchools(null, 1, 10);

		assertEquals(1, response.getContent().size());
		assertEquals("SCH-ALL", response.getContent().get(0).getCode());
	}

	@Test
	void getSchool_returnsMappedDto() {
		UUID schoolId = UUID.randomUUID();
		SchoolOrganization organization = new SchoolOrganization();
		organization.setId(organizationId);
		School school = new School();
		school.setId(schoolId);
		school.setOrganization(organization);
		school.setCode("SCH-GET");
		school.setName("Get School");
		when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));

		SchoolResponseDTO response = service.getSchool(schoolId);

		assertEquals("SCH-GET", response.getCode());
		assertEquals(organizationId, response.getOrganizationId());
	}

	@Test
	void updateSchool_success() {
		UUID schoolId = UUID.randomUUID();
		SchoolOrganization organization = new SchoolOrganization();
		organization.setId(organizationId);
		School school = new School();
		school.setId(schoolId);
		school.setOrganization(organization);
		school.setCode("OLD");
		school.setName("Old Name");

		when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
		when(schoolRepository.existsByOrganizationIdAndCodeAndIdNot(organizationId, "SCH-001", schoolId)).thenReturn(false);
		when(schoolRepository.save(any(School.class))).thenAnswer(invocation -> invocation.getArgument(0));

		SchoolResponseDTO response = service.updateSchool(schoolId, request);

		assertEquals("SCH-001", response.getCode());
		assertEquals("Sunrise School", response.getName());
	}

	@Test
	void updateSchool_duplicateCode_throwsConflict() {
		UUID schoolId = UUID.randomUUID();
		SchoolOrganization organization = new SchoolOrganization();
		organization.setId(organizationId);
		School school = new School();
		school.setId(schoolId);
		school.setOrganization(organization);

		when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
		when(schoolRepository.existsByOrganizationIdAndCodeAndIdNot(organizationId, "SCH-001", schoolId)).thenReturn(true);

		ResponseStatusException exception = assertThrows(ResponseStatusException.class,
				() -> service.updateSchool(schoolId, request));

		assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
	}

	@Test
	void deactivateSchool_setsInactive() {
		UUID schoolId = UUID.randomUUID();
		School school = new School();
		school.setId(schoolId);
		school.setStatus(RecordStatus.ACTIVE);
		when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));

		service.deactivateSchool(schoolId);

		assertEquals(RecordStatus.INACTIVE, school.getStatus());
		verify(schoolRepository).save(school);
	}

	@Test
	void activateSchool_setsActive() {
		UUID schoolId = UUID.randomUUID();
		School school = new School();
		school.setId(schoolId);
		school.setStatus(RecordStatus.INACTIVE);
		when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));

		service.activateSchool(schoolId);

		assertEquals(RecordStatus.ACTIVE, school.getStatus());
		verify(schoolRepository).save(school);
	}

	@Test
	void createSchool_blankCode_throwsBadRequest() {
		SchoolOrganization organization = new SchoolOrganization();
		organization.setId(organizationId);
		when(organizationRepository.findById(organizationId)).thenReturn(Optional.of(organization));
		request.setCode("   ");

		ResponseStatusException exception = assertThrows(ResponseStatusException.class,
				() -> service.createSchool(request));

		assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
	}

	@Test
	void createSchool_organizationMissing_throwsNotFound() {
		when(organizationRepository.findById(organizationId)).thenReturn(Optional.empty());

		ResponseStatusException exception = assertThrows(ResponseStatusException.class,
				() -> service.createSchool(request));

		assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
	}

	@Test
	void getSchool_missing_throwsNotFound() {
		UUID schoolId = UUID.randomUUID();
		when(schoolRepository.findById(schoolId)).thenReturn(Optional.empty());

		ResponseStatusException exception = assertThrows(ResponseStatusException.class,
				() -> service.getSchool(schoolId));

		assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
	}

	@Test
	void createSchool_trimsAndNullifiesOptionalAddressFields() {
		SchoolOrganization organization = new SchoolOrganization();
		organization.setId(organizationId);
		request.setCode("  SCH-TRIM ");
		request.setName("  Trim School ");
		request.setAddressLine1("   ");
		request.setAddressLine2(" Apt 1 ");
		request.setCity("  City  ");
		request.setState(" ");
		request.setCountry(" IN ");
		request.setPincode(" 560001 ");

		when(organizationRepository.findById(organizationId)).thenReturn(Optional.of(organization));
		when(schoolRepository.existsByOrganizationIdAndCode(organizationId, "SCH-TRIM")).thenReturn(false);
		when(schoolRepository.save(any(School.class))).thenAnswer(invocation -> {
			School school = invocation.getArgument(0);
			school.setId(UUID.randomUUID());
			return school;
		});

		SchoolResponseDTO response = service.createSchool(request);

		assertEquals("SCH-TRIM", response.getCode());
		assertEquals("Trim School", response.getName());
		assertEquals(null, response.getAddressLine1());
		assertEquals("Apt 1", response.getAddressLine2());
		assertEquals("City", response.getCity());
		assertEquals(null, response.getState());
		assertEquals("IN", response.getCountry());
		assertEquals("560001", response.getPincode());
	}
}
