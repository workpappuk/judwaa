package com.waajud.judwaa.modules.lms.school.service;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.lms.school.dto.ClassroomRequestDTO;
import com.waajud.judwaa.modules.lms.school.dto.ClassroomResponseDTO;
import com.waajud.judwaa.modules.lms.school.entity.Classroom;
import com.waajud.judwaa.modules.lms.school.entity.School;
import com.waajud.judwaa.modules.lms.school.repository.ClassroomRepository;
import com.waajud.judwaa.modules.lms.school.repository.SchoolRepository;
import com.waajud.judwaa.shared.RecordStatus;
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
public class ClassroomService {
	private final ClassroomRepository classroomRepository;
	private final SchoolRepository schoolRepository;

	public ClassroomService(ClassroomRepository classroomRepository, SchoolRepository schoolRepository) {
		this.classroomRepository = classroomRepository;
		this.schoolRepository = schoolRepository;
	}

	@Transactional
	public ClassroomResponseDTO createClassroom(ClassroomRequestDTO request) {
		School school = resolveSchool(request.getOrganizationId(), request.getSchoolId());
		String academicYear = normalizeRequired(request.getAcademicYear(), "Academic year is required");
		String grade = normalizeRequired(request.getGrade(), "Grade is required");
		String section = normalizeRequired(request.getSection(), "Section is required");

		if (classroomRepository.existsBySchoolIdAndAcademicYearAndGradeAndSection(school.getId(), academicYear, grade,
				section)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Classroom already exists for the same school, year, grade, and section");
		}

		Classroom classroom = new Classroom();
		classroom.setSchool(school);
		applyRequest(classroom, request, academicYear, grade, section);
		return toResponse(classroomRepository.save(classroom));
	}

	@Transactional
	public ClassroomResponseDTO updateClassroom(UUID classroomId, ClassroomRequestDTO request) {
		Classroom classroom = getClassroomOrThrow(classroomId);
		School school = resolveSchool(request.getOrganizationId(), request.getSchoolId());
		String academicYear = normalizeRequired(request.getAcademicYear(), "Academic year is required");
		String grade = normalizeRequired(request.getGrade(), "Grade is required");
		String section = normalizeRequired(request.getSection(), "Section is required");

		if (classroomRepository.existsBySchoolIdAndAcademicYearAndGradeAndSectionAndIdNot(school.getId(), academicYear,
				grade, section, classroomId)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Classroom already exists for the same school, year, grade, and section");
		}

		classroom.setSchool(school);
		applyRequest(classroom, request, academicYear, grade, section);
		return toResponse(classroomRepository.save(classroom));
	}

	@Transactional(readOnly = true)
	public ClassroomResponseDTO getClassroom(UUID classroomId) {
		return toResponse(getClassroomOrThrow(classroomId));
	}

	@Transactional(readOnly = true)
	public PaginatedResponseDTO<ClassroomResponseDTO> listClassrooms(UUID organizationId, UUID schoolId, int page, int size) {
		Pageable pageable = PageRequest.of(normalizePage(page), normalizeSize(size),
				Sort.by(Sort.Direction.ASC, "academicYear")
						.and(Sort.by(Sort.Direction.ASC, "grade"))
						.and(Sort.by(Sort.Direction.ASC, "section")));

		Page<Classroom> pageData;
		if (schoolId != null) {
			pageData = classroomRepository.findPageBySchoolId(schoolId, pageable);
		} else if (organizationId != null) {
			pageData = classroomRepository.findPageByOrganizationId(organizationId, pageable);
		} else {
			pageData = classroomRepository.findAll(pageable);
		}

		return PaginatedResponseDTO.fromPage(pageData.map(this::toResponse));
	}

	@Transactional
	public void deactivateClassroom(UUID classroomId) {
		Classroom classroom = getClassroomOrThrow(classroomId);
		classroom.setStatus(RecordStatus.INACTIVE);
		classroomRepository.save(classroom);
	}

	@Transactional
	public void activateClassroom(UUID classroomId) {
		Classroom classroom = getClassroomOrThrow(classroomId);
		classroom.setStatus(RecordStatus.ACTIVE);
		classroomRepository.save(classroom);
	}

	private School resolveSchool(UUID organizationId, UUID schoolId) {
		UUID safeSchoolId = Objects.requireNonNull(schoolId, "schoolId is required");
		UUID safeOrganizationId = Objects.requireNonNull(organizationId, "organizationId is required");
		School school = schoolRepository.findById(safeSchoolId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "School not found"));
		if (!school.getOrganization().getId().equals(safeOrganizationId)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"School does not belong to the specified organization");
		}
		return school;
	}

	private Classroom getClassroomOrThrow(UUID classroomId) {
		UUID safeId = Objects.requireNonNull(classroomId, "classroomId is required");
		return classroomRepository.findById(safeId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Classroom not found"));
	}

	private void applyRequest(Classroom classroom, ClassroomRequestDTO request, String academicYear, String grade,
			String section) {
		classroom.setAcademicYear(academicYear);
		classroom.setGrade(grade);
		classroom.setSection(section);
		classroom.setClassTeacherName(trimToNull(request.getClassTeacherName()));
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

	private ClassroomResponseDTO toResponse(Classroom classroom) {
		ClassroomResponseDTO dto = new ClassroomResponseDTO();
		dto.setId(classroom.getId());
		dto.setOrganizationId(classroom.getSchool().getOrganization().getId());
		dto.setSchoolId(classroom.getSchool().getId());
		dto.setSchoolCode(classroom.getSchool().getCode());
		dto.setAcademicYear(classroom.getAcademicYear());
		dto.setGrade(classroom.getGrade());
		dto.setSection(classroom.getSection());
		dto.setClassTeacherName(classroom.getClassTeacherName());
		dto.setStatus(classroom.getStatus());
		return dto;
	}

	private int normalizePage(int page) {
		return Math.max(0, page - 1);
	}

	private int normalizeSize(int size) {
		return Math.min(200, Math.max(1, size));
	}
}
