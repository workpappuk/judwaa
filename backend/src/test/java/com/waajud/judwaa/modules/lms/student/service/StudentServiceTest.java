package com.waajud.judwaa.modules.lms.student.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.lms.school.entity.Classroom;
import com.waajud.judwaa.modules.lms.school.entity.School;
import com.waajud.judwaa.modules.lms.school.entity.SchoolOrganization;
import com.waajud.judwaa.modules.lms.school.repository.ClassroomRepository;
import com.waajud.judwaa.modules.lms.school.repository.SchoolOrganizationRepository;
import com.waajud.judwaa.modules.lms.school.repository.SchoolRepository;
import com.waajud.judwaa.modules.lms.student.dto.StudentRequestDTO;
import com.waajud.judwaa.modules.lms.student.dto.StudentResponseDTO;
import com.waajud.judwaa.modules.lms.student.entity.Student;
import com.waajud.judwaa.modules.lms.student.repository.StudentRepository;
import com.waajud.judwaa.shared.RecordStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private SchoolOrganizationRepository organizationRepository;

    @Mock
    private SchoolRepository schoolRepository;

    @Mock
    private ClassroomRepository classroomRepository;

    @InjectMocks
    private StudentService service;

    private UUID orgId;
    private UUID schoolId;
    private UUID classroomId;
    private StudentRequestDTO request;
    private SchoolOrganization organization;
    private School school;
    private Classroom classroom;

    @BeforeEach
    void setUp() {
        orgId = UUID.randomUUID();
        schoolId = UUID.randomUUID();
        classroomId = UUID.randomUUID();

        organization = new SchoolOrganization();
        organization.setId(orgId);

        school = new School();
        school.setId(schoolId);
        school.setOrganization(organization);

        classroom = new Classroom();
        classroom.setId(classroomId);
        classroom.setSchool(school);

        request = new StudentRequestDTO();
        request.setOrganizationId(orgId);
        request.setSchoolId(schoolId);
        request.setClassroomId(classroomId);
        request.setAdmissionNo("ADM-001");
        request.setRollNo("R-001");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setGender("male");
    }

    @Test
    void createStudent_success() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(classroomRepository.findByIdAndSchoolId(classroomId, schoolId)).thenReturn(Optional.of(classroom));
        when(studentRepository.existsBySchoolIdAndAdmissionNo(schoolId, "ADM-001")).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> {
            Student student = invocation.getArgument(0);
            student.setId(UUID.randomUUID());
            student.setStatus(RecordStatus.ACTIVE);
            return student;
        });

        StudentResponseDTO response = service.createStudent(request);

        assertEquals("ADM-001", response.getAdmissionNo());
        assertEquals("MALE", response.getGender());
        assertEquals(orgId, response.getOrganizationId());
    }

    @Test
    void createStudent_duplicateAdmission_throwsConflict() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(classroomRepository.findByIdAndSchoolId(classroomId, schoolId)).thenReturn(Optional.of(classroom));
        when(studentRepository.existsBySchoolIdAndAdmissionNo(schoolId, "ADM-001")).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createStudent(request));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void updateStudent_duplicateAdmission_throwsConflict() {
        UUID studentId = UUID.randomUUID();
        Student existing = new Student();
        existing.setId(studentId);
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(existing));
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(classroomRepository.findByIdAndSchoolId(classroomId, schoolId)).thenReturn(Optional.of(classroom));
        when(studentRepository.existsBySchoolIdAndAdmissionNoAndIdNot(schoolId, "ADM-001", studentId)).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.updateStudent(studentId, request));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void updateStudent_duplicateRollNo_throwsConflict() {
        UUID studentId = UUID.randomUUID();
        Student existing = new Student();
        existing.setId(studentId);
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(existing));
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(classroomRepository.findByIdAndSchoolId(classroomId, schoolId)).thenReturn(Optional.of(classroom));
        when(studentRepository.existsBySchoolIdAndAdmissionNoAndIdNot(schoolId, "ADM-001", studentId)).thenReturn(false);
        when(studentRepository.existsBySchoolIdAndRollNoAndIdNot(schoolId, "R-001", studentId)).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.updateStudent(studentId, request));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void updateStudent_invalidGender_throwsBadRequest() {
        UUID studentId = UUID.randomUUID();
        Student existing = new Student();
        existing.setId(studentId);
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(existing));
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(classroomRepository.findByIdAndSchoolId(classroomId, schoolId)).thenReturn(Optional.of(classroom));
        when(studentRepository.existsBySchoolIdAndAdmissionNoAndIdNot(schoolId, "ADM-001", studentId)).thenReturn(false);
        request.setGender("x");

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.updateStudent(studentId, request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createStudent_schoolOutsideOrganization_throwsBadRequest() {
        SchoolOrganization otherOrg = new SchoolOrganization();
        otherOrg.setId(UUID.randomUUID());
        School schoolInOtherOrg = new School();
        schoolInOtherOrg.setId(schoolId);
        schoolInOtherOrg.setOrganization(otherOrg);

        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(schoolInOtherOrg));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createStudent(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createStudent_classroomOutsideSchool_throwsBadRequest() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(classroomRepository.findByIdAndSchoolId(classroomId, schoolId)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createStudent(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void listStudents_normalizesPageAndSize() {
        Student student = new Student();
        student.setId(UUID.randomUUID());
        student.setOrganization(organization);
        student.setSchool(school);
        student.setClassroom(classroom);
        student.setAdmissionNo("A");
        student.setFirstName("Z");

        Page<Student> page = new PageImpl<>(List.of(student));
        when(studentRepository.findAll(any(Pageable.class))).thenReturn(page);

        PaginatedResponseDTO<StudentResponseDTO> response = service.listStudents(orgId, schoolId, classroomId, 0, 1000);

        assertEquals(1, response.getContent().size());
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(studentRepository).findAll(captor.capture());
        Pageable usedPageable = captor.getValue();
        assertEquals(0, usedPageable.getPageNumber());
        assertEquals(200, usedPageable.getPageSize());
    }

    @Test
    void getStudent_notFound_throwsNotFound() {
        UUID studentId = UUID.randomUUID();
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.getStudent(studentId));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void updateStudent_blankRollNo_storesNull() {
        UUID studentId = UUID.randomUUID();
        Student existing = new Student();
        existing.setId(studentId);
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(existing));
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(classroomRepository.findByIdAndSchoolId(classroomId, schoolId)).thenReturn(Optional.of(classroom));
        when(studentRepository.existsBySchoolIdAndAdmissionNoAndIdNot(schoolId, "ADM-001", studentId)).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));
        request.setRollNo("   ");

        StudentResponseDTO response = service.updateStudent(studentId, request);

        assertNull(response.getRollNo());
    }

    @Test
    void deactivateAndActivateStudent_updatesStatus() {
        UUID studentId = UUID.randomUUID();
        Student student = new Student();
        student.setId(studentId);
        student.setStatus(RecordStatus.ACTIVE);
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));

        service.deactivateStudent(studentId);
        assertEquals(RecordStatus.INACTIVE, student.getStatus());

        service.activateStudent(studentId);
        assertEquals(RecordStatus.ACTIVE, student.getStatus());
        verify(studentRepository, org.mockito.Mockito.times(2)).save(eq(student));
    }

    @Test
    void createStudent_organizationMissing_throwsNotFound() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createStudent(request));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void createStudent_schoolMissing_throwsNotFound() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createStudent(request));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void createStudent_blankAdmission_throwsBadRequest() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(classroomRepository.findByIdAndSchoolId(classroomId, schoolId)).thenReturn(Optional.of(classroom));
        request.setAdmissionNo("   ");

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createStudent(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void updateStudent_success() {
        UUID studentId = UUID.randomUUID();
        Student existing = new Student();
        existing.setId(studentId);
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(existing));
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(classroomRepository.findByIdAndSchoolId(classroomId, schoolId)).thenReturn(Optional.of(classroom));
        when(studentRepository.existsBySchoolIdAndAdmissionNoAndIdNot(schoolId, "ADM-001", studentId)).thenReturn(false);
        when(studentRepository.existsBySchoolIdAndRollNoAndIdNot(schoolId, "R-001", studentId)).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StudentResponseDTO response = service.updateStudent(studentId, request);

        assertEquals("ADM-001", response.getAdmissionNo());
        assertEquals("MALE", response.getGender());
    }

    @Test
    void updateStudent_notFound_throwsNotFound() {
        UUID studentId = UUID.randomUUID();
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.updateStudent(studentId, request));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void createStudent_blankFirstName_throwsBadRequest() {
        request.setFirstName("   ");
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(classroomRepository.findByIdAndSchoolId(classroomId, schoolId)).thenReturn(Optional.of(classroom));
        when(studentRepository.existsBySchoolIdAndAdmissionNo(schoolId, "ADM-001")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.createStudent(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void updateStudent_blankAdmission_throwsBadRequest() {
        UUID studentId = UUID.randomUUID();
        Student existing = new Student();
        existing.setId(studentId);
        request.setAdmissionNo("  ");
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(existing));
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(classroomRepository.findByIdAndSchoolId(classroomId, schoolId)).thenReturn(Optional.of(classroom));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.updateStudent(studentId, request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createStudent_nullOrganizationId_throwsNullPointer() {
        request.setOrganizationId(null);

        assertThrows(NullPointerException.class, () -> service.createStudent(request));
    }

    @Test
    void createStudent_nullSchoolId_throwsNullPointer() {
        request.setSchoolId(null);

        assertThrows(NullPointerException.class, () -> service.createStudent(request));
    }

    @Test
    void createStudent_nullClassroomId_throwsNullPointer() {
        request.setClassroomId(null);

        assertThrows(NullPointerException.class, () -> service.createStudent(request));
    }

    @Test
    void createStudent_nullGender_allows() {
        request.setGender(null);
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(classroomRepository.findByIdAndSchoolId(classroomId, schoolId)).thenReturn(Optional.of(classroom));
        when(studentRepository.existsBySchoolIdAndAdmissionNo(schoolId, "ADM-001")).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> {
            Student student = invocation.getArgument(0);
            student.setId(UUID.randomUUID());
            return student;
        });

        StudentResponseDTO response = service.createStudent(request);

        assertEquals(null, response.getGender());
    }

    @Test
    void getStudent_nullId_throwsNullPointer() {
        assertThrows(NullPointerException.class, () -> service.getStudent(null));
    }
}
