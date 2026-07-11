package com.waajud.judwaa.modules.lms.student.service;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.shared.RecordStatus;
import com.waajud.judwaa.modules.lms.school.entity.Classroom;
import com.waajud.judwaa.modules.lms.school.entity.SchoolOrganization;
import com.waajud.judwaa.modules.lms.school.entity.School;
import com.waajud.judwaa.modules.lms.school.repository.ClassroomRepository;
import com.waajud.judwaa.modules.lms.school.repository.SchoolOrganizationRepository;
import com.waajud.judwaa.modules.lms.school.repository.SchoolRepository;
import com.waajud.judwaa.modules.lms.student.dto.StudentRequestDTO;
import com.waajud.judwaa.modules.lms.student.dto.StudentResponseDTO;
import com.waajud.judwaa.modules.lms.student.entity.Student;
import com.waajud.judwaa.modules.lms.student.repository.StudentRepository;
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
public class StudentService {
	private final StudentRepository studentRepository;
	private final SchoolOrganizationRepository schoolOrganizationRepository;
	private final SchoolRepository schoolRepository;
	private final ClassroomRepository classroomRepository;

	public StudentService(StudentRepository studentRepository, SchoolOrganizationRepository organizationRepository,
			SchoolRepository schoolRepository, ClassroomRepository classroomRepository) {
		this.studentRepository = studentRepository;
		this.schoolOrganizationRepository = organizationRepository;
		this.schoolRepository = schoolRepository;
		this.classroomRepository = classroomRepository;
	}

	@Transactional
	public StudentResponseDTO createStudent(StudentRequestDTO request) {
		Refs refs = resolveReferences(request.getOrganizationId(), request.getSchoolId(), request.getClassroomId());
		String normalizedAdmission = normalizeRequired(request.getAdmissionNo(), "Admission number is required");

		if (studentRepository.existsBySchoolIdAndAdmissionNo(refs.school().getId(), normalizedAdmission)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Admission number already exists in school");
		}

		Student student = new Student();
		student.setOrganization(refs.organization());
		student.setSchool(refs.school());
		student.setClassroom(refs.classroom());
		applyRequest(student, request, normalizedAdmission);
		return toResponse(studentRepository.save(student));
	}

	@Transactional
	public StudentResponseDTO updateStudent(UUID studentId, StudentRequestDTO request) {
		Student student = getStudentOrThrow(studentId);
		Refs refs = resolveReferences(request.getOrganizationId(), request.getSchoolId(), request.getClassroomId());
		String normalizedAdmission = normalizeRequired(request.getAdmissionNo(), "Admission number is required");

		if (studentRepository.existsBySchoolIdAndAdmissionNoAndIdNot(refs.school().getId(), normalizedAdmission,
				studentId)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Admission number already exists in school");
		}

		String normalizedRollNo = trimToNull(request.getRollNo());
		if (normalizedRollNo != null
				&& studentRepository.existsBySchoolIdAndRollNoAndIdNot(refs.school().getId(), normalizedRollNo, studentId)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Roll number already exists in school");
		}

		student.setOrganization(refs.organization());
		student.setSchool(refs.school());
		student.setClassroom(refs.classroom());
		applyRequest(student, request, normalizedAdmission);
		return toResponse(studentRepository.save(student));
	}

	@Transactional(readOnly = true)
	public StudentResponseDTO getStudent(UUID studentId) {
		return toResponse(getStudentOrThrow(studentId));
	}

	@Transactional(readOnly = true)
	public PaginatedResponseDTO<StudentResponseDTO> listStudents(UUID organizationId, UUID schoolId, UUID classroomId,
			int page, int size) {
		Pageable pageable = PageRequest.of(normalizePage(page), normalizeSize(size),
				Sort.by(Sort.Direction.ASC, "firstName").and(Sort.by(Sort.Direction.ASC, "lastName")));
		Page<Student> pageData;
		if (organizationId == null) {
			pageData = studentRepository.findAll(pageable);
		} else if (schoolId == null) {
			pageData = studentRepository.findByOrganizationId(organizationId, pageable);
		} else if (classroomId == null) {
			pageData = studentRepository.findByOrganizationIdAndSchoolId(organizationId, schoolId, pageable);
		} else {
			pageData = studentRepository.findByOrganizationIdAndSchoolIdAndClassroomId(organizationId, schoolId,
					classroomId, pageable);
		}
		return PaginatedResponseDTO.fromPage(pageData.map(this::toResponse));
	}

	@Transactional
	public void deactivateStudent(UUID studentId) {
		Student student = getStudentOrThrow(studentId);
		student.setStatus(RecordStatus.INACTIVE);
		studentRepository.save(student);
	}

	@Transactional
	public void activateStudent(UUID studentId) {
		Student student = getStudentOrThrow(studentId);
		student.setStatus(RecordStatus.ACTIVE);
		studentRepository.save(student);
	}

	private void applyRequest(Student student, StudentRequestDTO request, String normalizedAdmission) {
		student.setAdmissionNo(normalizedAdmission);
		student.setRollNo(trimToNull(request.getRollNo()));
		student.setFirstName(normalizeRequired(request.getFirstName(), "First name is required"));
		student.setLastName(trimToNull(request.getLastName()));
		student.setGender(normalizeGender(request.getGender()));
		student.setDateOfBirth(request.getDateOfBirth());
		student.setGuardianName(trimToNull(request.getGuardianName()));
		student.setGuardianPhone(trimToNull(request.getGuardianPhone()));
		student.setEnrolledAt(request.getEnrolledAt());
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

	private String normalizeGender(String value) {
		String normalized = trimToNull(value);
		if (normalized == null) {
			return null;
		}
		String upper = normalized.toUpperCase();
		if (!upper.equals("MALE") && !upper.equals("FEMALE") && !upper.equals("OTHER")) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gender must be MALE, FEMALE, or OTHER");
		}
		return upper;
	}

	private Student getStudentOrThrow(UUID studentId) {
		UUID safeStudentId = Objects.requireNonNull(studentId, "studentId is required");
		return studentRepository.findById(safeStudentId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
	}

	private Refs resolveReferences(UUID organizationId, UUID schoolId, UUID classroomId) {
		UUID safeOrgId = Objects.requireNonNull(organizationId, "organizationId is required");
		UUID safeSchoolId = Objects.requireNonNull(schoolId, "schoolId is required");
		UUID safeClassroomId = Objects.requireNonNull(classroomId, "classroomId is required");

		SchoolOrganization organization = schoolOrganizationRepository.findById(safeOrgId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
		School school = schoolRepository.findById(safeSchoolId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "School not found"));
		if (!school.getOrganization().getId().equals(organization.getId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"School does not belong to the specified organization");
		}

		Classroom classroom = classroomRepository.findByIdAndSchoolId(safeClassroomId, safeSchoolId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"Classroom does not belong to the specified school"));
		return new Refs(organization, school, classroom);
	}

	private StudentResponseDTO toResponse(Student student) {
		StudentResponseDTO dto = new StudentResponseDTO();
		dto.setId(student.getId());
		dto.setOrganizationId(student.getOrganization().getId());
		dto.setSchoolId(student.getSchool().getId());
		dto.setClassroomId(student.getClassroom().getId());
		dto.setAdmissionNo(student.getAdmissionNo());
		dto.setRollNo(student.getRollNo());
		dto.setFirstName(student.getFirstName());
		dto.setLastName(student.getLastName());
		dto.setGender(student.getGender());
		dto.setDateOfBirth(student.getDateOfBirth());
		dto.setGuardianName(student.getGuardianName());
		dto.setGuardianPhone(student.getGuardianPhone());
		dto.setEnrolledAt(student.getEnrolledAt());
		dto.setStatus(student.getStatus());
		return dto;
	}

	private int normalizePage(int page) {
		return Math.max(0, page - 1);
	}

	private int normalizeSize(int size) {
		return Math.min(200, Math.max(1, size));
	}

	private record Refs(SchoolOrganization organization, School school, Classroom classroom) {
	}
}
