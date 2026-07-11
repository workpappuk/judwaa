package com.waajud.judwaa.modules.lms.student.api;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.lms.student.dto.StudentRequestDTO;
import com.waajud.judwaa.modules.lms.student.dto.StudentResponseDTO;
import com.waajud.judwaa.modules.lms.student.service.StudentService;
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
@RequestMapping("/api/lms/students")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE,
		RequestMethod.OPTIONS}, allowedHeaders = "*", exposedHeaders = {"Content-Type", "Authorization"}, maxAge = 3600)
public class StudentController {
	private final StudentService studentService;

	public StudentController(StudentService studentService) {
		this.studentService = studentService;
	}

	@PostMapping
	public JudwaaResponse<StudentResponseDTO, String> createStudent(@RequestBody @Valid StudentRequestDTO request) {
		return JudwaaResponse.build(studentService.createStudent(request), HttpStatus.CREATED.getReasonPhrase(), HttpStatus.CREATED);
	}

	@PutMapping("/{studentId}")
	public JudwaaResponse<StudentResponseDTO, String> updateStudent(@PathVariable UUID studentId, @RequestBody @Valid StudentRequestDTO request) {
		return JudwaaResponse.build(studentService.updateStudent(studentId, request), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@GetMapping("/{studentId}")
	public JudwaaResponse<StudentResponseDTO, String> getStudent(@PathVariable UUID studentId) {
		return JudwaaResponse.build(studentService.getStudent(studentId), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@GetMapping
	public JudwaaResponse<PaginatedResponseDTO<StudentResponseDTO>, String> listStudents(@RequestParam(required = false) UUID organizationId,
			@RequestParam(required = false) UUID schoolId, @RequestParam(required = false) UUID classroomId,
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size) {
		return JudwaaResponse.build(studentService.listStudents(organizationId, schoolId, classroomId, page, size), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@PutMapping("/{studentId}/deactivate")
	public JudwaaResponse<Object, String> deactivateStudent(@PathVariable UUID studentId) {
		studentService.deactivateStudent(studentId);
		return JudwaaResponse.build(null, "Student deactivated", HttpStatus.OK);
	}

	@PutMapping("/{studentId}/activate")
	public JudwaaResponse<Object, String> activateStudent(@PathVariable UUID studentId) {
		studentService.activateStudent(studentId);
		return JudwaaResponse.build(null, "Student activated", HttpStatus.OK);
	}
}
