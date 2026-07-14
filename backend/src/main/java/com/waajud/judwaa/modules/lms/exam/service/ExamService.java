package com.waajud.judwaa.modules.lms.exam.service;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.lms.exam.dto.ExamRequestDTO;
import com.waajud.judwaa.modules.lms.exam.dto.ExamResponseDTO;
import com.waajud.judwaa.modules.lms.exam.dto.ExamSectionRequestDTO;
import com.waajud.judwaa.modules.lms.exam.dto.ExamSectionResponseDTO;
import com.waajud.judwaa.modules.lms.exam.dto.QuestionOptionRequestDTO;
import com.waajud.judwaa.modules.lms.exam.dto.QuestionOptionResponseDTO;
import com.waajud.judwaa.modules.lms.exam.dto.QuestionRequestDTO;
import com.waajud.judwaa.modules.lms.exam.dto.QuestionResponseDTO;
import com.waajud.judwaa.modules.lms.exam.entity.Exam;
import com.waajud.judwaa.modules.lms.exam.entity.ExamSection;
import com.waajud.judwaa.modules.lms.exam.entity.ExamType;
import com.waajud.judwaa.modules.lms.exam.entity.Question;
import com.waajud.judwaa.modules.lms.exam.entity.QuestionOption;
import com.waajud.judwaa.modules.lms.exam.entity.QuestionType;
import com.waajud.judwaa.modules.lms.exam.repository.ExamRepository;
import com.waajud.judwaa.modules.lms.school.entity.School;
import com.waajud.judwaa.modules.lms.school.entity.SchoolOrganization;
import com.waajud.judwaa.modules.lms.school.repository.SchoolOrganizationRepository;
import com.waajud.judwaa.modules.lms.school.repository.SchoolRepository;
import com.waajud.judwaa.shared.RecordStatus;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ExamService {
	private final ExamRepository examRepository;
	private final SchoolOrganizationRepository schoolOrganizationRepository;
	private final SchoolRepository schoolRepository;

	public ExamService(ExamRepository examRepository, SchoolOrganizationRepository schoolOrganizationRepository,
			SchoolRepository schoolRepository) {
		this.examRepository = examRepository;
		this.schoolOrganizationRepository = schoolOrganizationRepository;
		this.schoolRepository = schoolRepository;
	}

	@Transactional
	public ExamResponseDTO createExam(ExamRequestDTO request) {
		Refs refs = resolveReferences(request.getOrganizationId(), request.getSchoolId());
		String normalizedCode = normalizeRequired(request.getCode(), "Exam code is required").toUpperCase();
		if (examRepository.existsByOrganizationIdAndCode(refs.organization().getId(), normalizedCode)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Exam code already exists in organization");
		}

		Exam exam = new Exam();
		exam.setOrganization(refs.organization());
		exam.setSchool(refs.school());
		applyRequest(exam, request, normalizedCode);
		return toResponse(examRepository.save(exam));
	}

	@Transactional
	public ExamResponseDTO updateExam(UUID examId, ExamRequestDTO request) {
		Exam exam = getExamOrThrow(examId);
		Refs refs = resolveReferences(request.getOrganizationId(), request.getSchoolId());
		String normalizedCode = normalizeRequired(request.getCode(), "Exam code is required").toUpperCase();
		if (examRepository.existsByOrganizationIdAndCodeAndIdNot(refs.organization().getId(), normalizedCode, examId)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Exam code already exists in organization");
		}

		exam.setOrganization(refs.organization());
		exam.setSchool(refs.school());
		applyRequest(exam, request, normalizedCode);
		return toResponse(examRepository.save(exam));
	}

	@Transactional(readOnly = true)
	public ExamResponseDTO getExam(UUID examId) {
		return toResponse(getExamOrThrow(examId));
	}

	@Transactional(readOnly = true)
	public PaginatedResponseDTO<ExamResponseDTO> listExams(UUID organizationId, UUID schoolId, ExamType examType,
			int page, int size) {
		Pageable pageable = PageRequest.of(normalizePage(page), normalizeSize(size),
				Sort.by(Sort.Direction.DESC, "createdAt"));

		Specification<Exam> spec = (root, query, cb) -> cb.conjunction();
		if (organizationId != null) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("organization").get("id"), organizationId));
		}
		if (schoolId != null) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("school").get("id"), schoolId));
		}
		if (examType != null) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("examType"), examType));
		}

		Page<Exam> pageData = examRepository.findAll(spec, pageable);
		return PaginatedResponseDTO.fromPage(pageData.map(this::toResponse));
	}

	@Transactional
	public void deactivateExam(UUID examId) {
		Exam exam = getExamOrThrow(examId);
		exam.setStatus(RecordStatus.INACTIVE);
		examRepository.save(exam);
	}

	@Transactional
	public void activateExam(UUID examId) {
		Exam exam = getExamOrThrow(examId);
		exam.setStatus(RecordStatus.ACTIVE);
		examRepository.save(exam);
	}

	private void applyRequest(Exam exam, ExamRequestDTO request, String normalizedCode) {
		validateSchedule(request);
		validateSections(request.getSections());

		exam.setCode(normalizedCode);
		exam.setTitle(normalizeRequired(request.getTitle(), "Exam title is required"));
		exam.setDescription(trimToNull(request.getDescription()));
		exam.setExamType(Objects.requireNonNull(request.getExamType(), "examType is required"));
		exam.setStartsAt(request.getStartsAt());
		exam.setEndsAt(request.getEndsAt());
		exam.setDurationMinutes(validatePositiveInt(request.getDurationMinutes(), "Duration must be greater than 0"));
		exam.setTotalMarks(validatePositiveDouble(request.getTotalMarks(), "Total marks must be greater than 0"));
		exam.setSections(buildSections(request.getSections()));
	}

	private List<ExamSection> buildSections(List<ExamSectionRequestDTO> sectionRequests) {
		List<ExamSection> sections = new ArrayList<>();
		if (sectionRequests == null) {
			return sections;
		}
		for (ExamSectionRequestDTO sectionRequest : sectionRequests) {
			ExamSection section = new ExamSection();
			section.setDisplayOrder(requireNonNull(sectionRequest.getDisplayOrder(), "Section display order is required"));
			section.setTitle(normalizeRequired(sectionRequest.getTitle(), "Section title is required"));
			section.setDescription(trimToNull(sectionRequest.getDescription()));
			section.setMaxMarks(validatePositiveDouble(sectionRequest.getMaxMarks(), "Section max marks must be greater than 0"));
			section.setQuestions(buildQuestions(sectionRequest.getQuestions()));
			sections.add(section);
		}
		return sections;
	}

	private List<Question> buildQuestions(List<QuestionRequestDTO> questionRequests) {
		List<Question> questions = new ArrayList<>();
		if (questionRequests == null) {
			return questions;
		}
		for (QuestionRequestDTO questionRequest : questionRequests) {
			QuestionType questionType = Objects.requireNonNull(questionRequest.getQuestionType(), "Question type is required");
			Question question = new Question();
			question.setDisplayOrder(requireNonNull(questionRequest.getDisplayOrder(), "Question display order is required"));
			question.setQuestionType(questionType);
			question.setQuestionText(normalizeRequired(questionRequest.getQuestionText(), "Question text is required"));
			question.setMarks(requirePositive(questionRequest.getMarks(), "Question marks must be greater than 0"));
			question.setMandatory(questionRequest.isMandatory());
			question.setExplanation(trimToNull(questionRequest.getExplanation()));
			question.setOptions(buildOptions(questionRequest.getOptions()));
			validateQuestionOptions(questionType, question.getOptions());
			questions.add(question);
		}
		return questions;
	}

	private List<QuestionOption> buildOptions(List<QuestionOptionRequestDTO> optionRequests) {
		List<QuestionOption> options = new ArrayList<>();
		if (optionRequests == null) {
			return options;
		}
		for (QuestionOptionRequestDTO optionRequest : optionRequests) {
			QuestionOption option = new QuestionOption();
			option.setDisplayOrder(requireNonNull(optionRequest.getDisplayOrder(), "Option display order is required"));
			option.setOptionText(normalizeRequired(optionRequest.getOptionText(), "Option text is required"));
			option.setCorrect(optionRequest.isCorrect());
			options.add(option);
		}
		return options;
	}

	private void validateSections(List<ExamSectionRequestDTO> sections) {
		if (sections == null || sections.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exam must have at least one section");
		}
		for (ExamSectionRequestDTO section : sections) {
			if (section.getQuestions() == null || section.getQuestions().isEmpty()) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each section must have at least one question");
			}
		}
	}

	private void validateQuestionOptions(QuestionType questionType, List<QuestionOption> options) {
		if (!isChoiceQuestion(questionType)) {
			return;
		}
		if (options == null || options.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Choice-based questions must contain at least one option");
		}

		long correctCount = options.stream().filter(option -> option != null && option.isCorrect()).count();
		if (questionType == QuestionType.MULTIPLE_CHOICE) {
			if (correctCount < 1) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"Multiple choice question must have at least one correct option");
			}
			return;
		}

		if (correctCount != 1) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Single choice/true-false question must have exactly one correct option");
		}
	}

	private boolean isChoiceQuestion(QuestionType questionType) {
		return questionType == QuestionType.SINGLE_CHOICE || questionType == QuestionType.MULTIPLE_CHOICE
				|| questionType == QuestionType.TRUE_FALSE;
	}

	private void validateSchedule(ExamRequestDTO request) {
		if (request.getStartsAt() != null && request.getEndsAt() != null && request.getEndsAt().isBefore(request.getStartsAt())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exam end time must be after start time");
		}
	}

	private Integer validatePositiveInt(Integer value, String message) {
		if (value == null) {
			return null;
		}
		if (value <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
		}
		return value;
	}

	private Double validatePositiveDouble(Double value, String message) {
		if (value == null) {
			return null;
		}
		if (value <= 0.0d) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
		}
		return value;
	}

	private double requirePositive(Double value, String message) {
		if (value == null || value <= 0.0d) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
		}
		return value;
	}

	private <T> T requireNonNull(T value, String message) {
		if (value == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
		}
		return value;
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

	private Exam getExamOrThrow(UUID examId) {
		UUID safeExamId = Objects.requireNonNull(examId, "examId is required");
		return examRepository.findById(safeExamId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found"));
	}

	private Refs resolveReferences(UUID organizationId, UUID schoolId) {
		UUID safeOrganizationId = Objects.requireNonNull(organizationId, "organizationId is required");
		SchoolOrganization organization = schoolOrganizationRepository.findById(safeOrganizationId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));

		if (schoolId == null) {
			return new Refs(organization, null);
		}

		School school = schoolRepository.findById(schoolId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "School not found"));
		if (!school.getOrganization().getId().equals(organization.getId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"School does not belong to the specified organization");
		}
		return new Refs(organization, school);
	}

	private ExamResponseDTO toResponse(Exam exam) {
		ExamResponseDTO dto = new ExamResponseDTO();
		dto.setId(exam.getId());
		dto.setOrganizationId(exam.getOrganization().getId());
		dto.setSchoolId(exam.getSchool() == null ? null : exam.getSchool().getId());
		dto.setCode(exam.getCode());
		dto.setTitle(exam.getTitle());
		dto.setDescription(exam.getDescription());
		dto.setExamType(exam.getExamType());
		dto.setStartsAt(exam.getStartsAt());
		dto.setEndsAt(exam.getEndsAt());
		dto.setDurationMinutes(exam.getDurationMinutes());
		dto.setTotalMarks(exam.getTotalMarks());
		dto.setStatus(exam.getStatus());

		List<ExamSectionResponseDTO> sectionDtos = new ArrayList<>();
		for (ExamSection section : exam.getSections()) {
			ExamSectionResponseDTO sectionDto = new ExamSectionResponseDTO();
			sectionDto.setId(section.getId());
			sectionDto.setDisplayOrder(section.getDisplayOrder());
			sectionDto.setTitle(section.getTitle());
			sectionDto.setDescription(section.getDescription());
			sectionDto.setMaxMarks(section.getMaxMarks());
			sectionDto.setStatus(section.getStatus());

			List<QuestionResponseDTO> questionDtos = new ArrayList<>();
			for (Question question : section.getQuestions()) {
				QuestionResponseDTO questionDto = new QuestionResponseDTO();
				questionDto.setId(question.getId());
				questionDto.setDisplayOrder(question.getDisplayOrder());
				questionDto.setQuestionType(question.getQuestionType());
				questionDto.setQuestionText(question.getQuestionText());
				questionDto.setMarks(question.getMarks());
				questionDto.setMandatory(question.isMandatory());
				questionDto.setExplanation(question.getExplanation());
				questionDto.setStatus(question.getStatus());

				List<QuestionOptionResponseDTO> optionDtos = new ArrayList<>();
				for (QuestionOption option : question.getOptions()) {
					QuestionOptionResponseDTO optionDto = new QuestionOptionResponseDTO();
					optionDto.setId(option.getId());
					optionDto.setDisplayOrder(option.getDisplayOrder());
					optionDto.setOptionText(option.getOptionText());
					optionDto.setCorrect(option.isCorrect());
					optionDto.setStatus(option.getStatus());
					optionDtos.add(optionDto);
				}
				questionDto.setOptions(optionDtos);
				questionDtos.add(questionDto);
			}
			sectionDto.setQuestions(questionDtos);
			sectionDtos.add(sectionDto);
		}
		dto.setSections(sectionDtos);
		return dto;
	}

	private int normalizePage(int page) {
		return Math.max(0, page - 1);
	}

	private int normalizeSize(int size) {
		return Math.min(200, Math.max(1, size));
	}

	private record Refs(SchoolOrganization organization, School school) {
	}
}
