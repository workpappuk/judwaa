package com.waajud.judwaa.modules.lms.school.api;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.lms.school.dto.ClassroomRequestDTO;
import com.waajud.judwaa.modules.lms.school.dto.ClassroomResponseDTO;
import com.waajud.judwaa.modules.lms.school.service.ClassroomService;
import com.waajud.judwaa.shared.JudwaaResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lms/classrooms")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE,
		RequestMethod.OPTIONS}, allowedHeaders = "*", exposedHeaders = {"Content-Type", "Authorization"}, maxAge = 3600)
public class ClassroomController {
	private final ClassroomService classroomService;

	public ClassroomController(ClassroomService classroomService) {
		this.classroomService = classroomService;
	}

	@PostMapping
	public JudwaaResponse<ClassroomResponseDTO, String> createClassroom(@RequestBody @Valid ClassroomRequestDTO request) {
		return JudwaaResponse.build(classroomService.createClassroom(request), HttpStatus.CREATED.getReasonPhrase(), HttpStatus.CREATED);
	}

	@PutMapping("/{classroomId}")
	public JudwaaResponse<ClassroomResponseDTO, String> updateClassroom(@PathVariable UUID classroomId,
			@RequestBody @Valid ClassroomRequestDTO request) {
		return JudwaaResponse.build(classroomService.updateClassroom(classroomId, request), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@GetMapping("/{classroomId}")
	public JudwaaResponse<ClassroomResponseDTO, String> getClassroom(@PathVariable UUID classroomId) {
		return JudwaaResponse.build(classroomService.getClassroom(classroomId), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@GetMapping
	public JudwaaResponse<PaginatedResponseDTO<ClassroomResponseDTO>, String> listClassrooms(
			@RequestParam(required = false) UUID organizationId,
			@RequestParam(required = false) UUID schoolId,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int size) {
		return JudwaaResponse.build(classroomService.listClassrooms(organizationId, schoolId, page, size),
				HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@PutMapping("/{classroomId}/deactivate")
	public JudwaaResponse<Object, String> deactivateClassroom(@PathVariable UUID classroomId) {
		classroomService.deactivateClassroom(classroomId);
		return JudwaaResponse.build(null, "Classroom deactivated", HttpStatus.OK);
	}

	@PutMapping("/{classroomId}/activate")
	public JudwaaResponse<Object, String> activateClassroom(@PathVariable UUID classroomId) {
		classroomService.activateClassroom(classroomId);
		return JudwaaResponse.build(null, "Classroom activated", HttpStatus.OK);
	}
}
