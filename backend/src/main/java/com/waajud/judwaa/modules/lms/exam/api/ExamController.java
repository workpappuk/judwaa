package com.waajud.judwaa.modules.lms.exam.api;

import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.lms.exam.dto.ExamRequestDTO;
import com.waajud.judwaa.modules.lms.exam.dto.ExamResponseDTO;
import com.waajud.judwaa.modules.lms.exam.entity.ExamType;
import com.waajud.judwaa.modules.lms.exam.service.ExamService;
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
@RequestMapping("/api/lms/exams")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE,
		RequestMethod.OPTIONS}, allowedHeaders = "*", exposedHeaders = {"Content-Type", "Authorization"}, maxAge = 3600)
public class ExamController {
	private final ExamService examService;

	public ExamController(ExamService examService) {
		this.examService = examService;
	}

	@PostMapping
	public JudwaaResponse<ExamResponseDTO, String> createExam(@RequestBody @Valid ExamRequestDTO request) {
		return JudwaaResponse.build(examService.createExam(request), HttpStatus.CREATED.getReasonPhrase(), HttpStatus.CREATED);
	}

	@PutMapping("/{examId}")
	public JudwaaResponse<ExamResponseDTO, String> updateExam(@PathVariable UUID examId, @RequestBody @Valid ExamRequestDTO request) {
		return JudwaaResponse.build(examService.updateExam(examId, request), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@GetMapping("/{examId}")
	public JudwaaResponse<ExamResponseDTO, String> getExam(@PathVariable UUID examId) {
		return JudwaaResponse.build(examService.getExam(examId), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@GetMapping
	public JudwaaResponse<PaginatedResponseDTO<ExamResponseDTO>, String> listExams(
			@RequestParam(required = false) UUID organizationId,
			@RequestParam(required = false) UUID schoolId,
			@RequestParam(required = false) ExamType examType,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int size) {
		return JudwaaResponse.build(examService.listExams(organizationId, schoolId, examType, page, size),
				HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@PutMapping("/{examId}/deactivate")
	public JudwaaResponse<Object, String> deactivateExam(@PathVariable UUID examId) {
		examService.deactivateExam(examId);
		return JudwaaResponse.build(null, "Exam deactivated", HttpStatus.OK);
	}

	@PutMapping("/{examId}/activate")
	public JudwaaResponse<Object, String> activateExam(@PathVariable UUID examId) {
		examService.activateExam(examId);
		return JudwaaResponse.build(null, "Exam activated", HttpStatus.OK);
	}
}
