package com.waajud.judwaa.modules.lms.school.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.lms.school.dto.ClassroomResponseDTO;
import com.waajud.judwaa.modules.lms.school.entity.Classroom;
import com.waajud.judwaa.modules.lms.school.entity.School;
import com.waajud.judwaa.modules.lms.school.entity.SchoolOrganization;
import com.waajud.judwaa.modules.lms.school.repository.ClassroomRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

@ExtendWith(MockitoExtension.class)
class ClassroomServiceTest {

	@Mock
	private ClassroomRepository classroomRepository;

	@InjectMocks
	private ClassroomService service;

	private Classroom classroom;
	private UUID organizationId;
	private UUID schoolId;

	@BeforeEach
	void setUp() {
		organizationId = UUID.randomUUID();
		schoolId = UUID.randomUUID();
		classroom = new Classroom();
		classroom.setId(UUID.randomUUID());
		classroom.setAcademicYear("2026-27");
		classroom.setGrade("8");
		classroom.setSection("A");
		classroom.setClassTeacherName("Teacher One");

		SchoolOrganization organization = new SchoolOrganization();
		organization.setId(organizationId);
		School school = new School();
		school.setId(schoolId);
		school.setCode("SCH-101");
		school.setOrganization(organization);
		classroom.setSchool(school);
	}

	@Test
	void listClassrooms_bySchool_usesSchoolFilter() {
		Page<Classroom> page = new PageImpl<>(List.of(classroom));
		when(classroomRepository.findPageBySchoolId(eq(schoolId), any(org.springframework.data.domain.Pageable.class))).thenReturn(page);

		PaginatedResponseDTO<ClassroomResponseDTO> response = service.listClassrooms(null, schoolId, 1, 20);

		assertEquals(1, response.getContent().size());
		assertEquals("SCH-101", response.getContent().get(0).getSchoolCode());
	}

	@Test
	void listClassrooms_byOrganization_usesOrganizationFilter() {
		Page<Classroom> page = new PageImpl<>(List.of(classroom));
		when(classroomRepository.findPageByOrganizationId(eq(organizationId), any(org.springframework.data.domain.Pageable.class))).thenReturn(page);

		PaginatedResponseDTO<ClassroomResponseDTO> response = service.listClassrooms(organizationId, null, 1, 20);

		assertEquals(1, response.getContent().size());
		assertEquals(organizationId, response.getContent().get(0).getOrganizationId());
	}

	@Test
	void listClassrooms_withoutFilters_returnsAll() {
		Page<Classroom> page = new PageImpl<>(List.of(classroom));
		when(classroomRepository.findAll(any(org.springframework.data.domain.Pageable.class))).thenReturn(page);

		PaginatedResponseDTO<ClassroomResponseDTO> response = service.listClassrooms(null, null, 1, 20);

		assertEquals(1, response.getContent().size());
		assertEquals("8", response.getContent().get(0).getGrade());
	}

	@Test
	void listClassrooms_normalizesPaging() {
		Page<Classroom> page = new PageImpl<>(List.of(classroom));
		when(classroomRepository.findAll(any(org.springframework.data.domain.Pageable.class))).thenReturn(page);

		service.listClassrooms(null, null, -1, 9999);

		org.mockito.ArgumentCaptor<org.springframework.data.domain.Pageable> captor = org.mockito.ArgumentCaptor.forClass(org.springframework.data.domain.Pageable.class);
		org.mockito.Mockito.verify(classroomRepository).findAll(captor.capture());
		assertEquals(0, captor.getValue().getPageNumber());
		assertEquals(200, captor.getValue().getPageSize());
	}
}
