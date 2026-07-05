package com.waajud.judwaa.modules.lms.student.api;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.lms.student.dto.StudentRequestDTO;
import com.waajud.judwaa.modules.lms.student.dto.StudentResponseDTO;
import com.waajud.judwaa.modules.lms.student.service.StudentService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
	public ResponseEntity<StudentResponseDTO> createStudent(@RequestBody @Valid StudentRequestDTO request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(studentService.createStudent(request));
	}

	@PutMapping("/{studentId}")
	public StudentResponseDTO updateStudent(@PathVariable UUID studentId, @RequestBody @Valid StudentRequestDTO request) {
		return studentService.updateStudent(studentId, request);
	}

	@GetMapping("/{studentId}")
	public StudentResponseDTO getStudent(@PathVariable UUID studentId) {
		return studentService.getStudent(studentId);
	}

	@GetMapping
	public PaginatedResponseDTO<StudentResponseDTO> listStudents(@RequestParam(required = false) UUID organizationId,
			@RequestParam(required = false) UUID schoolId, @RequestParam(required = false) UUID classroomId,
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size) {
		return studentService.listStudents(organizationId, schoolId, classroomId, page, size);
	}

	@PutMapping("/{studentId}/deactivate")
	public ResponseEntity<Void> deactivateStudent(@PathVariable UUID studentId) {
		studentService.deactivateStudent(studentId);
		return ResponseEntity.noContent().build();
	}

	@PutMapping("/{studentId}/activate")
	public ResponseEntity<Void> activateStudent(@PathVariable UUID studentId) {
		studentService.activateStudent(studentId);
		return ResponseEntity.noContent().build();
	}
}
