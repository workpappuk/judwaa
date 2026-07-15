package com.waajud.judwaa.modules.lms;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.waajud.judwaa.modules.lms.exam.entity.Exam;
import com.waajud.judwaa.modules.lms.exam.repository.ExamEnrollmentRepository;
import com.waajud.judwaa.modules.lms.exam.repository.ExamRepository;
import com.waajud.judwaa.modules.lms.school.entity.Classroom;
import com.waajud.judwaa.modules.lms.school.entity.School;
import com.waajud.judwaa.modules.lms.school.entity.SchoolOrganization;
import com.waajud.judwaa.modules.lms.school.entity.Subject;
import com.waajud.judwaa.modules.lms.school.repository.ClassroomRepository;
import com.waajud.judwaa.modules.lms.school.repository.SchoolOrganizationRepository;
import com.waajud.judwaa.modules.lms.school.repository.SchoolRepository;
import com.waajud.judwaa.modules.lms.school.repository.SubjectRepository;
import com.waajud.judwaa.modules.lms.seed.CurrentClass;
import com.waajud.judwaa.modules.lms.seed.JsonClassroom;
import com.waajud.judwaa.modules.lms.seed.JsonExamEnrollmentSeed;
import com.waajud.judwaa.modules.lms.seed.JsonExamSectionSeed;
import com.waajud.judwaa.modules.lms.seed.JsonExamSeed;
import com.waajud.judwaa.modules.lms.seed.JsonQuestionOptionSeed;
import com.waajud.judwaa.modules.lms.seed.JsonQuestionSeed;
import com.waajud.judwaa.modules.lms.seed.JsonSchool;
import com.waajud.judwaa.modules.lms.seed.JsonStudent;
import com.waajud.judwaa.modules.lms.seed.Trust;
import com.waajud.judwaa.modules.lms.student.entity.Student;
import com.waajud.judwaa.modules.lms.student.repository.StudentRepository;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.CommandLineRunner;

@ExtendWith(MockitoExtension.class)
class LMSModuleSetupTest {

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private SchoolOrganizationRepository organizationRepository;

    @Mock
    private SchoolRepository schoolRepository;

    @Mock
    private ClassroomRepository classroomRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private ExamRepository examRepository;

    @Mock
    private ExamEnrollmentRepository examEnrollmentRepository;

    @Test
    void seedLMS_executesFullFlow() throws Exception {
        LMSModuleSetup setup = new LMSModuleSetup(objectMapper, organizationRepository, schoolRepository, classroomRepository,
                subjectRepository, studentRepository, examRepository, examEnrollmentRepository);

        JsonClassroom defaultClassroom = new JsonClassroom();
        defaultClassroom.setAcademicYear("2026-27");
        defaultClassroom.setName("10");
        defaultClassroom.setSection("A");
        defaultClassroom.setSubjects(List.of("Math", "Science"));

        JsonSchool jsonSchool = new JsonSchool();
        jsonSchool.setName("Sunrise");
        jsonSchool.setCode("SCH-01");
        jsonSchool.setBoard(Set.of("CBSE"));
        jsonSchool.setClassrooms(null);

        Trust trust = new Trust();
        trust.setName("Trust");
        trust.setCode("TR-01");
        trust.setSchools(List.of(jsonSchool));

        CurrentClass currentClass = new CurrentClass();
        currentClass.setGrade("10");
        currentClass.setSection("A");

        JsonStudent jsonStudent = new JsonStudent();
        jsonStudent.setSchoolCode("SCH-01");
        jsonStudent.setCurrentClass(currentClass);
        jsonStudent.setAdmissionNo("ADM-01");
        jsonStudent.setRollNo("1");
        jsonStudent.setFirstName("A");
        jsonStudent.setLastName("B");
        jsonStudent.setGender("M");
        jsonStudent.setDateOfBirth("2010-01-01");
        jsonStudent.setGuardianName("G");
        jsonStudent.setGuardianPhone("999");
        jsonStudent.setEnrolledAt("2026-06-01");

        JsonQuestionOptionSeed option = new JsonQuestionOptionSeed();
        option.setDisplayOrder(1);
        option.setOptionText("A");
        option.setCorrect(true);

        JsonQuestionSeed question = new JsonQuestionSeed();
        question.setDisplayOrder(1);
        question.setQuestionType("SINGLE_CHOICE");
        question.setQuestionText("Q");
        question.setMarks(1.0);
        question.setMandatory(true);
        question.setOptions(List.of(option));

        JsonExamSectionSeed section = new JsonExamSectionSeed();
        section.setDisplayOrder(1);
        section.setTitle("Section");
        section.setDescription("Desc");
        section.setMaxMarks(1.0);
        section.setQuestions(List.of(question));

        JsonExamSeed examSeed = new JsonExamSeed();
        examSeed.setSchoolCode("SCH-01");
        examSeed.setCode("EX-01");
        examSeed.setTitle("Exam");
        examSeed.setDescription("Desc");
        examSeed.setExamType("SCHOOL");
        examSeed.setStartAfterMinutes(10);
        examSeed.setDurationMinutes(30);
        examSeed.setTotalMarks(1.0);
        examSeed.setSections(List.of(section));

        JsonExamEnrollmentSeed enrollment = new JsonExamEnrollmentSeed();
        enrollment.setSchoolCode("SCH-01");
        enrollment.setExamCode("EX-01");
        enrollment.setStudentAdmissionNos(List.of("ADM-01"));

        when(objectMapper.readValue(any(InputStream.class), any(TypeReference.class))).thenReturn(
                List.of(defaultClassroom),
                List.of(trust),
                List.of(jsonStudent),
                List.of(examSeed),
                List.of(enrollment));

        when(organizationRepository.save(any(SchoolOrganization.class))).thenAnswer(invocation -> {
            SchoolOrganization org = invocation.getArgument(0);
            org.setId(UUID.randomUUID());
            return org;
        });

        final School[] savedSchool = new School[1];
        when(schoolRepository.save(any(School.class))).thenAnswer(invocation -> {
            School school = invocation.getArgument(0);
            school.setId(UUID.randomUUID());
            savedSchool[0] = school;
            return school;
        });

        final Classroom[] savedClassroom = new Classroom[1];
        when(classroomRepository.save(any(Classroom.class))).thenAnswer(invocation -> {
            Classroom classroom = invocation.getArgument(0);
            classroom.setId(UUID.randomUUID());
            savedClassroom[0] = classroom;
            return classroom;
        });

        when(subjectRepository.save(any(Subject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        when(schoolRepository.findByCode("SCH-01")).thenAnswer(invocation -> savedSchool[0]);
        when(classroomRepository.findByGradeAndSectionAndSchool(any(String.class), any(String.class), any(School.class)))
            .thenAnswer(invocation -> savedClassroom[0]);

        Student student = new Student();
        student.setId(UUID.randomUUID());
        student.setAdmissionNo("ADM-01");
        when(studentRepository.findBySchoolId(any(UUID.class))).thenReturn(List.of(student));

        when(examRepository.existsByOrganizationIdAndCode(any(UUID.class), any(String.class))).thenReturn(false);
        final Exam[] savedExam = new Exam[1];
        when(examRepository.save(any(Exam.class))).thenAnswer(invocation -> {
            Exam exam = invocation.getArgument(0);
            exam.setId(UUID.randomUUID());
            savedExam[0] = exam;
            return exam;
        });

        when(examRepository.findByOrganizationIdAndCode(any(UUID.class), any(String.class)))
                .thenAnswer(invocation -> Optional.ofNullable(savedExam[0]));
        when(examEnrollmentRepository.existsByExamIdAndStudentId(any(UUID.class), any(UUID.class))).thenReturn(false);

        CommandLineRunner runner = setup.seedLMS();
        runner.run();

        verify(organizationRepository).save(any(SchoolOrganization.class));
        verify(schoolRepository).save(any(School.class));
        verify(classroomRepository).save(any(Classroom.class));
        verify(subjectRepository, org.mockito.Mockito.atLeastOnce()).save(any(Subject.class));
        verify(studentRepository).save(any(Student.class));
        verify(examRepository).save(any(Exam.class));
        verify(examEnrollmentRepository).save(any());
    }

    @Test
    void seedLMS_whenSeedReadFails_throws() throws Exception {
        LMSModuleSetup setup = new LMSModuleSetup(objectMapper, organizationRepository, schoolRepository, classroomRepository,
                subjectRepository, studentRepository, examRepository, examEnrollmentRepository);

        when(objectMapper.readValue(any(InputStream.class), any(TypeReference.class)))
                .thenThrow(new IOException("seed read failed"));

        CommandLineRunner runner = setup.seedLMS();

        assertThrows(JsonProcessingException.class, runner::run);
    }

    @Test
    void seedLMS_skipPaths_doNotFail() throws Exception {
        LMSModuleSetup setup = new LMSModuleSetup(objectMapper, organizationRepository, schoolRepository, classroomRepository,
                subjectRepository, studentRepository, examRepository, examEnrollmentRepository);

        JsonClassroom defaultClassroom = new JsonClassroom();
        defaultClassroom.setAcademicYear("2026-27");
        defaultClassroom.setName("10");
        defaultClassroom.setSection("A");
        defaultClassroom.setSubjects(List.of("Math"));

        Trust trust = new Trust();
        JsonSchool jsonSchool = new JsonSchool();
        jsonSchool.setName("Sunrise");
        jsonSchool.setCode("SCH-01");
        jsonSchool.setBoard(Set.of("CBSE"));
        jsonSchool.setClassrooms(List.of(defaultClassroom));
        trust.setName("Trust");
        trust.setCode("TR-01");
        trust.setSchools(List.of(jsonSchool));

        CurrentClass currentClass = new CurrentClass();
        currentClass.setGrade("10");
        currentClass.setSection("A");
        JsonStudent jsonStudent = new JsonStudent();
        jsonStudent.setSchoolCode("MISSING");
        jsonStudent.setCurrentClass(currentClass);
        jsonStudent.setAdmissionNo("ADM-MISS");
        jsonStudent.setDateOfBirth("2010-01-01");
        jsonStudent.setEnrolledAt("2026-06-01");

        JsonExamSeed examSeed = new JsonExamSeed();
        examSeed.setSchoolCode("MISSING");
        examSeed.setCode("EX-SKIP");
        examSeed.setExamType("SCHOOL");
        examSeed.setDurationMinutes(30);
        examSeed.setTotalMarks(50.0);
        examSeed.setSections(List.of());

        JsonExamEnrollmentSeed enrollment = new JsonExamEnrollmentSeed();
        enrollment.setSchoolCode("SCH-01");
        enrollment.setExamCode("EX-01");
        enrollment.setStudentAdmissionNos(List.of("ADM-MISS"));

        when(objectMapper.readValue(any(InputStream.class), any(TypeReference.class))).thenReturn(
                List.of(defaultClassroom),
                List.of(trust),
                List.of(jsonStudent),
                List.of(examSeed),
                List.of(enrollment));

        SchoolOrganization organization = new SchoolOrganization();
        organization.setId(UUID.randomUUID());
        when(organizationRepository.save(any(SchoolOrganization.class))).thenReturn(organization);

        School school = new School();
        school.setId(UUID.randomUUID());
        school.setOrganization(organization);
        when(schoolRepository.save(any(School.class))).thenReturn(school);
        when(schoolRepository.findByCode("MISSING")).thenReturn(null);
        when(schoolRepository.findByCode("SCH-01")).thenReturn(school);

        Classroom classroom = new Classroom();
        classroom.setId(UUID.randomUUID());
        classroom.setSchool(school);
        when(classroomRepository.save(any(Classroom.class))).thenReturn(classroom);

        when(examRepository.findByOrganizationIdAndCode(any(UUID.class), any(String.class))).thenReturn(Optional.empty());

        CommandLineRunner runner = setup.seedLMS();

        assertDoesNotThrow(() -> runner.run(new String[0]));
    }
}
