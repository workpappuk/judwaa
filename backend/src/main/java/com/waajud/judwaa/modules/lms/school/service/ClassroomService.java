package com.waajud.judwaa.modules.lms.school.service;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.lms.school.dto.ClassroomResponseDTO;
import com.waajud.judwaa.modules.lms.school.entity.Classroom;
import com.waajud.judwaa.modules.lms.school.repository.ClassroomRepository;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClassroomService {
	private final ClassroomRepository classroomRepository;

	public ClassroomService(ClassroomRepository classroomRepository) {
		this.classroomRepository = classroomRepository;
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
