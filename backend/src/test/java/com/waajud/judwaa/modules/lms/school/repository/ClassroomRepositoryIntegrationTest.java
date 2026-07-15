package com.waajud.judwaa.modules.lms.school.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.waajud.judwaa.modules.lms.school.entity.Classroom;
import com.waajud.judwaa.modules.lms.school.entity.School;
import com.waajud.judwaa.modules.lms.school.entity.SchoolOrganization;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ClassroomRepositoryIntegrationTest {

	@Autowired
	private ClassroomRepository classroomRepository;

	@Autowired
	private SchoolRepository schoolRepository;

	@Autowired
	private SchoolOrganizationRepository schoolOrganizationRepository;

	private UUID org1Id;
	private UUID org2Id;
	private UUID school1Id;
	private UUID school2Id;

	@BeforeEach
	void setUp() {
		String suffix = UUID.randomUUID().toString().substring(0, 8);

		SchoolOrganization org1 = new SchoolOrganization();
		org1.setCode("ORG-A-" + suffix);
		org1.setName("Org A");
		org1 = schoolOrganizationRepository.save(org1);
		org1Id = org1.getId();

		SchoolOrganization org2 = new SchoolOrganization();
		org2.setCode("ORG-B-" + suffix);
		org2.setName("Org B");
		org2 = schoolOrganizationRepository.save(org2);
		org2Id = org2.getId();

		School school1 = new School();
		school1.setOrganization(org1);
		school1.setCode("SCH-A1-" + suffix);
		school1.setName("School A1");
		school1 = schoolRepository.save(school1);
		school1Id = school1.getId();

		School school2 = new School();
		school2.setOrganization(org2);
		school2.setCode("SCH-B1-" + suffix);
		school2.setName("School B1");
		school2 = schoolRepository.save(school2);
		school2Id = school2.getId();

		Classroom c1 = new Classroom();
		c1.setSchool(school1);
		c1.setAcademicYear("2026-27");
		c1.setGrade("8");
		c1.setSection("A");
		classroomRepository.save(c1);

		Classroom c2 = new Classroom();
		c2.setSchool(school1);
		c2.setAcademicYear("2026-27");
		c2.setGrade("8");
		c2.setSection("B");
		classroomRepository.save(c2);

		Classroom c3 = new Classroom();
		c3.setSchool(school2);
		c3.setAcademicYear("2026-27");
		c3.setGrade("9");
		c3.setSection("A");
		classroomRepository.save(c3);
	}

	@Test
	void findPageBySchoolId_returnsOnlyMatchingSchoolClassrooms() {
		Page<Classroom> page = classroomRepository.findPageBySchoolId(school1Id, PageRequest.of(0, 10));
		assertEquals(2, page.getTotalElements());
	}

	@Test
	void findPageByOrganizationId_returnsOnlyMatchingOrganizationClassrooms() {
		Page<Classroom> page = classroomRepository.findPageByOrganizationId(org2Id, PageRequest.of(0, 10));
		assertEquals(1, page.getTotalElements());
		assertEquals(school2Id, page.getContent().get(0).getSchool().getId());
	}
}
