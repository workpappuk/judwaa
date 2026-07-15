package com.waajud.judwaa.modules.lms.exam.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.lms.exam.dto.ExamRequestDTO;
import com.waajud.judwaa.modules.lms.exam.dto.ExamResponseDTO;
import com.waajud.judwaa.modules.lms.exam.dto.ExamSectionRequestDTO;
import com.waajud.judwaa.modules.lms.exam.dto.QuestionOptionRequestDTO;
import com.waajud.judwaa.modules.lms.exam.dto.QuestionRequestDTO;
import com.waajud.judwaa.modules.lms.exam.entity.Exam;
import com.waajud.judwaa.modules.lms.exam.entity.ExamType;
import com.waajud.judwaa.modules.lms.exam.entity.QuestionType;
import com.waajud.judwaa.modules.lms.exam.repository.ExamRepository;
import com.waajud.judwaa.modules.lms.school.entity.School;
import com.waajud.judwaa.modules.lms.school.entity.SchoolOrganization;
import com.waajud.judwaa.modules.lms.school.repository.SchoolOrganizationRepository;
import com.waajud.judwaa.modules.lms.school.repository.SchoolRepository;
import com.waajud.judwaa.shared.RecordStatus;
import java.time.Instant;
import java.util.List;
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
class ExamServiceTest {

    @Mock
    private ExamRepository examRepository;

    @Mock
    private SchoolOrganizationRepository organizationRepository;

    @Mock
    private SchoolRepository schoolRepository;

    @InjectMocks
    private ExamService service;

    private UUID orgId;
    private UUID schoolId;
    private SchoolOrganization organization;
    private School school;
    private ExamRequestDTO validRequest;

    @BeforeEach
    void setUp() {
        orgId = UUID.randomUUID();
        schoolId = UUID.randomUUID();

        organization = new SchoolOrganization();
        organization.setId(orgId);

        school = new School();
        school.setId(schoolId);
        school.setOrganization(organization);

        validRequest = buildValidRequest();
    }

    @Test
    void createExam_success() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);
        when(examRepository.save(any(Exam.class))).thenAnswer(invocation -> {
            Exam exam = invocation.getArgument(0);
            exam.setId(UUID.randomUUID());
            exam.setStatus(RecordStatus.ACTIVE);
            return exam;
        });

        ExamResponseDTO response = service.createExam(validRequest);

        assertEquals("EX-01", response.getCode());
        assertEquals(1, response.getSections().size());
        assertEquals(orgId, response.getOrganizationId());
    }

    @Test
    void createExam_withoutSchool_allowsOrganizationWideExam() {
        ExamRequestDTO request = buildValidRequest();
        request.setSchoolId(null);

        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);
        when(examRepository.save(any(Exam.class))).thenAnswer(invocation -> {
            Exam exam = invocation.getArgument(0);
            exam.setId(UUID.randomUUID());
            exam.setStatus(RecordStatus.ACTIVE);
            return exam;
        });

        ExamResponseDTO response = service.createExam(request);

        assertEquals(orgId, response.getOrganizationId());
        assertNull(response.getSchoolId());
    }

    @Test
    void createExam_duplicateCode_throwsConflict() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.createExam(validRequest));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void updateExam_duplicateCode_throwsConflict() {
        UUID examId = UUID.randomUUID();
        Exam existing = new Exam();
        existing.setId(examId);
        when(examRepository.findById(examId)).thenReturn(Optional.of(existing));
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCodeAndIdNot(orgId, "EX-01", examId)).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.updateExam(examId, validRequest));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void createExam_invalidSchedule_throwsBadRequest() {
        ExamRequestDTO request = buildValidRequest();
        request.setStartsAt(Instant.parse("2026-07-20T10:00:00Z"));
        request.setEndsAt(Instant.parse("2026-07-20T09:00:00Z"));

        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createExam(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createExam_withoutSections_throwsBadRequest() {
        ExamRequestDTO request = buildValidRequest();
        request.setSections(List.of());

        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createExam(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createExam_sectionWithoutQuestions_throwsBadRequest() {
        ExamRequestDTO request = buildValidRequest();
        request.getSections().get(0).setQuestions(List.of());

        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createExam(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createExam_multipleChoiceWithoutCorrectOption_throwsBadRequest() {
        ExamRequestDTO request = buildValidRequest();
        QuestionRequestDTO question = request.getSections().get(0).getQuestions().get(0);
        question.setQuestionType(QuestionType.MULTIPLE_CHOICE);
        question.getOptions().forEach(option -> option.setCorrect(false));

        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createExam(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createExam_singleChoiceWithMultipleCorrect_throwsBadRequest() {
        ExamRequestDTO request = buildValidRequest();
        QuestionRequestDTO question = request.getSections().get(0).getQuestions().get(0);
        question.setQuestionType(QuestionType.SINGLE_CHOICE);
        question.getOptions().forEach(option -> option.setCorrect(true));

        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createExam(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createExam_choiceQuestionWithoutOptions_throwsBadRequest() {
        ExamRequestDTO request = buildValidRequest();
        QuestionRequestDTO question = request.getSections().get(0).getQuestions().get(0);
        question.setQuestionType(QuestionType.TRUE_FALSE);
        question.setOptions(List.of());

        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createExam(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createExam_nonChoiceQuestion_allowsNoOptions() {
        ExamRequestDTO request = buildValidRequest();
        QuestionRequestDTO question = request.getSections().get(0).getQuestions().get(0);
        question.setQuestionType(QuestionType.SHORT_ANSWER);
        question.setOptions(List.of());

        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);
        when(examRepository.save(any(Exam.class))).thenAnswer(invocation -> {
            Exam exam = invocation.getArgument(0);
            exam.setId(UUID.randomUUID());
            exam.setStatus(RecordStatus.ACTIVE);
            return exam;
        });

        ExamResponseDTO response = service.createExam(request);

        assertEquals(1, response.getSections().size());
        assertEquals(QuestionType.SHORT_ANSWER, response.getSections().get(0).getQuestions().get(0).getQuestionType());
    }

    @Test
    void listExams_returnsPage() {
        Exam exam = new Exam();
        exam.setId(UUID.randomUUID());
        exam.setOrganization(organization);
        exam.setSchool(school);
        exam.setCode("EX-01");
        exam.setTitle("Exam");
        exam.setExamType(ExamType.SCHOOL);
        exam.setSections(List.of());

        Page<Exam> page = new PageImpl<>(List.of(exam));
        when(examRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class),
                any(org.springframework.data.domain.Pageable.class))).thenReturn(page);

        PaginatedResponseDTO<ExamResponseDTO> response = service.listExams(orgId, schoolId, ExamType.SCHOOL, 1, 10);

        assertEquals(1, response.getContent().size());
        assertEquals("EX-01", response.getContent().get(0).getCode());
    }

    @Test
    void activateAndDeactivateExam_updatesStatus() {
        UUID examId = UUID.randomUUID();
        Exam exam = new Exam();
        exam.setId(examId);
        exam.setStatus(RecordStatus.ACTIVE);
        when(examRepository.findById(examId)).thenReturn(Optional.of(exam));

        service.deactivateExam(examId);
        assertEquals(RecordStatus.INACTIVE, exam.getStatus());

        service.activateExam(examId);
        assertEquals(RecordStatus.ACTIVE, exam.getStatus());
        verify(examRepository, org.mockito.Mockito.times(2)).save(any(Exam.class));
    }

    @Test
    void getExam_notFound_throwsNotFound() {
        UUID examId = UUID.randomUUID();
        when(examRepository.findById(examId)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.getExam(examId));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void createExam_schoolNotInOrganization_throwsBadRequest() {
        SchoolOrganization otherOrg = new SchoolOrganization();
        otherOrg.setId(UUID.randomUUID());
        School schoolInOtherOrg = new School();
        schoolInOtherOrg.setId(schoolId);
        schoolInOtherOrg.setOrganization(otherOrg);

        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(schoolInOtherOrg));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.createExam(validRequest));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createExam_organizationNotFound_throwsNotFound() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.createExam(validRequest));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void createExam_schoolNotFound_throwsNotFound() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.createExam(validRequest));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void updateExam_success() {
        UUID examId = UUID.randomUUID();
        Exam existing = new Exam();
        existing.setId(examId);
        when(examRepository.findById(examId)).thenReturn(Optional.of(existing));
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCodeAndIdNot(orgId, "EX-01", examId)).thenReturn(false);
        when(examRepository.save(any(Exam.class))).thenAnswer(invocation -> {
            Exam exam = invocation.getArgument(0);
            exam.setStatus(RecordStatus.ACTIVE);
            return exam;
        });

        ExamResponseDTO response = service.updateExam(examId, validRequest);

        assertEquals("EX-01", response.getCode());
    }

    @Test
    void updateExam_notFound_throwsNotFound() {
        UUID examId = UUID.randomUUID();
        when(examRepository.findById(examId)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.updateExam(examId, validRequest));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void createExam_nullExamType_throws() {
        ExamRequestDTO request = buildValidRequest();
        request.setExamType(null);
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);

        assertThrows(NullPointerException.class, () -> service.createExam(request));
    }

    @Test
    void createExam_nullSectionDisplayOrder_throwsBadRequest() {
        ExamRequestDTO request = buildValidRequest();
        request.getSections().get(0).setDisplayOrder(null);
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createExam(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createExam_nullOptionDisplayOrder_throwsBadRequest() {
        ExamRequestDTO request = buildValidRequest();
        request.getSections().get(0).getQuestions().get(0).getOptions().get(0).setDisplayOrder(null);
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createExam(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createExam_blankOptionText_throwsBadRequest() {
        ExamRequestDTO request = buildValidRequest();
        request.getSections().get(0).getQuestions().get(0).getOptions().get(0).setOptionText("   ");
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createExam(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void listExams_withNoFilters_usesPaginationSafeguards() {
        when(examRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class),
                any(org.springframework.data.domain.Pageable.class))).thenReturn(new PageImpl<>(List.of()));

        PaginatedResponseDTO<ExamResponseDTO> response = service.listExams(null, null, null, 0, 999);

        assertEquals(0, response.getContent().size());
    }

    @Test
    void createExam_nullQuestionType_throws() {
        ExamRequestDTO request = buildValidRequest();
        request.getSections().get(0).getQuestions().get(0).setQuestionType(null);
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);

        assertThrows(NullPointerException.class, () -> service.createExam(request));
    }

    @Test
    void createExam_blankQuestionText_throwsBadRequest() {
        ExamRequestDTO request = buildValidRequest();
        request.getSections().get(0).getQuestions().get(0).setQuestionText("  ");
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createExam(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createExam_nullQuestionMarks_throwsBadRequest() {
        ExamRequestDTO request = buildValidRequest();
        request.getSections().get(0).getQuestions().get(0).setMarks(null);
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createExam(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createExam_nullDuration_allows() {
        ExamRequestDTO request = buildValidRequest();
        request.setDurationMinutes(null);
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);
        when(examRepository.save(any(Exam.class))).thenAnswer(invocation -> {
            Exam exam = invocation.getArgument(0);
            exam.setId(UUID.randomUUID());
            return exam;
        });

        ExamResponseDTO response = service.createExam(request);

        assertEquals(null, response.getDurationMinutes());
    }

    @Test
    void createExam_nullTotalMarks_allows() {
        ExamRequestDTO request = buildValidRequest();
        request.setTotalMarks(null);
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);
        when(examRepository.save(any(Exam.class))).thenAnswer(invocation -> {
            Exam exam = invocation.getArgument(0);
            exam.setId(UUID.randomUUID());
            return exam;
        });

        ExamResponseDTO response = service.createExam(request);

        assertEquals(null, response.getTotalMarks());
    }

    @Test
    void createExam_nonChoiceWithNullOptions_allows() {
        ExamRequestDTO request = buildValidRequest();
        QuestionRequestDTO question = request.getSections().get(0).getQuestions().get(0);
        question.setQuestionType(QuestionType.SHORT_ANSWER);
        question.setOptions(null);
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);
        when(examRepository.save(any(Exam.class))).thenAnswer(invocation -> {
            Exam exam = invocation.getArgument(0);
            exam.setId(UUID.randomUUID());
            return exam;
        });

        ExamResponseDTO response = service.createExam(request);

        assertEquals(0, response.getSections().get(0).getQuestions().get(0).getOptions().size());
    }

    @Test
    void createExam_multipleChoiceWithOneCorrect_allows() {
        ExamRequestDTO request = buildValidRequest();
        QuestionRequestDTO question = request.getSections().get(0).getQuestions().get(0);
        question.setQuestionType(QuestionType.MULTIPLE_CHOICE);
        question.getOptions().get(0).setCorrect(true);
        question.getOptions().get(1).setCorrect(false);
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);
        when(examRepository.save(any(Exam.class))).thenAnswer(invocation -> {
            Exam exam = invocation.getArgument(0);
            exam.setId(UUID.randomUUID());
            return exam;
        });

        ExamResponseDTO response = service.createExam(request);

        assertEquals(QuestionType.MULTIPLE_CHOICE,
                response.getSections().get(0).getQuestions().get(0).getQuestionType());
    }

    @Test
    void createExam_trueFalseWithOneCorrect_allows() {
        ExamRequestDTO request = buildValidRequest();
        QuestionRequestDTO question = request.getSections().get(0).getQuestions().get(0);
        question.setQuestionType(QuestionType.TRUE_FALSE);
        question.getOptions().get(0).setCorrect(true);
        question.getOptions().get(1).setCorrect(false);
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);
        when(examRepository.save(any(Exam.class))).thenAnswer(invocation -> {
            Exam exam = invocation.getArgument(0);
            exam.setId(UUID.randomUUID());
            return exam;
        });

        ExamResponseDTO response = service.createExam(request);

        assertEquals(QuestionType.TRUE_FALSE,
                response.getSections().get(0).getQuestions().get(0).getQuestionType());
    }

    @Test
    void createExam_blankCode_throwsBadRequest() {
        ExamRequestDTO request = buildValidRequest();
        request.setCode("   ");
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.createExam(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void getExam_success() {
        UUID examId = UUID.randomUUID();
        Exam exam = new Exam();
        exam.setId(examId);
        exam.setOrganization(organization);
        exam.setSchool(school);
        exam.setCode("EX-01");
        exam.setTitle("Exam");
        exam.setExamType(ExamType.SCHOOL);
        exam.setSections(List.of());
        when(examRepository.findById(examId)).thenReturn(Optional.of(exam));

        ExamResponseDTO response = service.getExam(examId);

        assertEquals("EX-01", response.getCode());
    }

    @Test
    void createExam_negativeDuration_throwsBadRequest() {
        ExamRequestDTO request = buildValidRequest();
        request.setDurationMinutes(-10);
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createExam(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createExam_negativeSectionMaxMarks_throwsBadRequest() {
        ExamRequestDTO request = buildValidRequest();
        request.getSections().get(0).setMaxMarks(-1d);
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createExam(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createExam_negativeQuestionMarks_throwsBadRequest() {
        ExamRequestDTO request = buildValidRequest();
        request.getSections().get(0).getQuestions().get(0).setMarks(-2d);
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(examRepository.existsByOrganizationIdAndCode(orgId, "EX-01")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.createExam(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    private ExamRequestDTO buildValidRequest() {
        ExamRequestDTO request = new ExamRequestDTO();
        request.setOrganizationId(orgId);
        request.setSchoolId(schoolId);
        request.setCode("ex-01");
        request.setTitle("Weekly Test");
        request.setDescription("  weekly test  ");
        request.setExamType(ExamType.SCHOOL);
        request.setDurationMinutes(60);
        request.setTotalMarks(100.0);

        QuestionOptionRequestDTO option1 = new QuestionOptionRequestDTO();
        option1.setDisplayOrder(1);
        option1.setOptionText("A");
        option1.setCorrect(true);

        QuestionOptionRequestDTO option2 = new QuestionOptionRequestDTO();
        option2.setDisplayOrder(2);
        option2.setOptionText("B");
        option2.setCorrect(false);

        QuestionRequestDTO question = new QuestionRequestDTO();
        question.setDisplayOrder(1);
        question.setQuestionType(QuestionType.SINGLE_CHOICE);
        question.setQuestionText("Question?");
        question.setMarks(5.0);
        question.setMandatory(true);
        question.setOptions(List.of(option1, option2));

        ExamSectionRequestDTO section = new ExamSectionRequestDTO();
        section.setDisplayOrder(1);
        section.setTitle("Section A");
        section.setDescription("desc");
        section.setMaxMarks(100.0);
        section.setQuestions(List.of(question));

        request.setSections(List.of(section));
        return request;
    }
}
