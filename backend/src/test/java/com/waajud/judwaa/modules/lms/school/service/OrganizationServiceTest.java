package com.waajud.judwaa.modules.lms.school.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.lms.school.dto.OrganizationRequestDTO;
import com.waajud.judwaa.modules.lms.school.dto.OrganizationResponseDTO;
import com.waajud.judwaa.modules.lms.school.entity.SchoolOrganization;
import com.waajud.judwaa.modules.lms.school.repository.SchoolOrganizationRepository;
import com.waajud.judwaa.shared.RecordStatus;
import java.util.Optional;
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
class OrganizationServiceTest {

	@Mock
	private SchoolOrganizationRepository repository;

	@InjectMocks
	private OrganizationService service;

	private OrganizationRequestDTO request;

	@BeforeEach
	void setUp() {
		request = new OrganizationRequestDTO();
		request.setCode("ORG-001");
		request.setName("Alpha Trust");
		request.setContactEmail("alpha@example.com");
		request.setContactPhone("9999999999");
		request.setAddressLine1("Line 1");
	}

	@Test
	void createOrganization_success() {
		when(repository.existsByCode("ORG-001")).thenReturn(false);
		when(repository.save(any(SchoolOrganization.class))).thenAnswer(invocation -> {
			SchoolOrganization entity = invocation.getArgument(0);
			entity.setId(UUID.randomUUID());
			entity.setStatus(RecordStatus.ACTIVE);
			return entity;
		});

		OrganizationResponseDTO response = service.createOrganization(request);

		assertEquals("ORG-001", response.getCode());
		assertEquals("Alpha Trust", response.getName());
		assertEquals("alpha@example.com", response.getContactEmail());
	}

	@Test
	void createOrganization_duplicateCode_throwsConflict() {
		when(repository.existsByCode("ORG-001")).thenReturn(true);

		ResponseStatusException exception = assertThrows(ResponseStatusException.class,
				() -> service.createOrganization(request));

		assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
	}

	@Test
	void updateOrganization_notFound_throwsNotFound() {
		UUID organizationId = UUID.randomUUID();
		when(repository.findById(organizationId)).thenReturn(Optional.empty());

		ResponseStatusException exception = assertThrows(ResponseStatusException.class,
				() -> service.updateOrganization(organizationId, request));

		assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
	}

	@Test
	void updateOrganization_success() {
		UUID organizationId = UUID.randomUUID();
		SchoolOrganization organization = new SchoolOrganization();
		organization.setId(organizationId);
		organization.setCode("OLD");
		organization.setName("Old Name");

		when(repository.findById(organizationId)).thenReturn(Optional.of(organization));
		when(repository.existsByCodeAndIdNot("ORG-001", organizationId)).thenReturn(false);
		when(repository.save(any(SchoolOrganization.class))).thenAnswer(invocation -> invocation.getArgument(0));

		OrganizationResponseDTO response = service.updateOrganization(organizationId, request);

		assertEquals("ORG-001", response.getCode());
		assertEquals("Alpha Trust", response.getName());
	}

	@Test
	void listOrganizations_returnsMappedPage() {
		SchoolOrganization organization = new SchoolOrganization();
		organization.setId(UUID.randomUUID());
		organization.setCode("ORG-001");
		organization.setName("Alpha Trust");
		Page<SchoolOrganization> page = new PageImpl<>(java.util.List.of(organization));
		when(repository.findAll(any(org.springframework.data.domain.Pageable.class))).thenReturn(page);

		PaginatedResponseDTO<OrganizationResponseDTO> response = service.listOrganizations(1, 20);

		assertEquals(1, response.getContent().size());
		assertEquals("ORG-001", response.getContent().get(0).getCode());
	}

	@Test
	void deactivateOrganization_setsInactive() {
		UUID organizationId = UUID.randomUUID();
		SchoolOrganization organization = new SchoolOrganization();
		organization.setId(organizationId);
		organization.setStatus(RecordStatus.ACTIVE);
		when(repository.findById(organizationId)).thenReturn(Optional.of(organization));

		service.deactivateOrganization(organizationId);

		assertEquals(RecordStatus.INACTIVE, organization.getStatus());
		verify(repository).save(organization);
	}

	@Test
	void activateOrganization_setsActive() {
		UUID organizationId = UUID.randomUUID();
		SchoolOrganization organization = new SchoolOrganization();
		organization.setId(organizationId);
		organization.setStatus(RecordStatus.INACTIVE);
		when(repository.findById(organizationId)).thenReturn(Optional.of(organization));

		service.activateOrganization(organizationId);

		assertEquals(RecordStatus.ACTIVE, organization.getStatus());
		verify(repository).save(organization);
	}

	@Test
	void createOrganization_trimsOptionalFieldsToNull() {
		request.setContactEmail("   ");
		request.setContactPhone("  ");
		when(repository.existsByCode("ORG-001")).thenReturn(false);
		when(repository.save(any(SchoolOrganization.class))).thenAnswer(invocation -> invocation.getArgument(0));

		OrganizationResponseDTO response = service.createOrganization(request);

		assertNull(response.getContactEmail());
		assertNull(response.getContactPhone());
	}

	@Test
	void createOrganization_blankCode_throwsBadRequest() {
		request.setCode(" ");

		ResponseStatusException exception = assertThrows(ResponseStatusException.class,
				() -> service.createOrganization(request));

		assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
	}

	@Test
	void updateOrganization_duplicateCode_throwsConflict() {
		UUID organizationId = UUID.randomUUID();
		SchoolOrganization organization = new SchoolOrganization();
		organization.setId(organizationId);
		when(repository.findById(organizationId)).thenReturn(Optional.of(organization));
		when(repository.existsByCodeAndIdNot("ORG-001", organizationId)).thenReturn(true);

		ResponseStatusException exception = assertThrows(ResponseStatusException.class,
				() -> service.updateOrganization(organizationId, request));

		assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
	}
}
