package com.waajud.judwaa.modules.incentive.api;

import java.util.UUID;

import com.waajud.judwaa.shared.JudwaaResponse;
import com.waajud.judwaa.shared.RecordStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.waajud.judwaa.modules.incentive.dto.request.IncentiveRuleRequestDTO;
import com.waajud.judwaa.modules.incentive.dto.request.IncentiveSchemeRequestDTO;
import com.waajud.judwaa.modules.incentive.dto.response.IncentiveCalculationRunResponseDTO;
import com.waajud.judwaa.modules.incentive.dto.response.IncentiveRuleResponseDTO;
import com.waajud.judwaa.modules.incentive.dto.response.IncentiveSchemeResponseDTO;
import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.incentive.service.IncentiveService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/incentives")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE,
		RequestMethod.OPTIONS}, allowedHeaders = "*", exposedHeaders = {"Content-Type", "Authorization"}, maxAge = 3600)
public class IncentiveController {
	private final IncentiveService incentiveService;

	public IncentiveController(IncentiveService incentiveService) {
		this.incentiveService = incentiveService;
	}

	@GetMapping("/schemes")
	public JudwaaResponse<PaginatedResponseDTO<IncentiveSchemeResponseDTO>, String> listSchemes(
			@RequestParam(required = false) RecordStatus status, @RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int size) {
		return JudwaaResponse.build(
				incentiveService.listSchemes(status, page, size),
				HttpStatus.OK.getReasonPhrase(),
				HttpStatus.OK
		);
	}

	@PostMapping("/schemes")
	public JudwaaResponse<IncentiveSchemeResponseDTO, String> createScheme(
			@RequestBody @Valid IncentiveSchemeRequestDTO request) {
		return JudwaaResponse.build(incentiveService.createScheme(request), HttpStatus.CREATED.getReasonPhrase(), HttpStatus.CREATED);
	}

	@PutMapping("/schemes/{schemeId}")
	public JudwaaResponse<IncentiveSchemeResponseDTO, String> updateScheme(@PathVariable UUID schemeId,
			@RequestBody @Valid IncentiveSchemeRequestDTO request) {
		return JudwaaResponse.build(incentiveService.updateScheme(schemeId, request), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@GetMapping("/schemes/{schemeId}/rules")
	public JudwaaResponse<PaginatedResponseDTO<IncentiveRuleResponseDTO>, String> listRules(@PathVariable UUID schemeId,
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size) {
		return JudwaaResponse.build(incentiveService.listRules(schemeId, page, size), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@PostMapping("/schemes/{schemeId}/rules")
	public JudwaaResponse<IncentiveRuleResponseDTO, String> createRule(@PathVariable UUID schemeId,
			@RequestBody @Valid IncentiveRuleRequestDTO request) {
		return JudwaaResponse.build(incentiveService.createRule(schemeId, request), HttpStatus.CREATED.getReasonPhrase(), HttpStatus.CREATED);
	}

	@PutMapping("/rules/{ruleId}")
	public JudwaaResponse<IncentiveRuleResponseDTO, String> updateRule(@PathVariable UUID ruleId,
			@RequestBody @Valid IncentiveRuleRequestDTO request) {
		return JudwaaResponse.build(incentiveService.updateRule(ruleId, request), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@DeleteMapping("/rules/{ruleId}")
	public JudwaaResponse<Object, String> deleteRule(@PathVariable UUID ruleId) {
		incentiveService.deleteRule(ruleId);
		return JudwaaResponse.build(null, "Rule deleted", HttpStatus.OK);
	}

	@PostMapping("/schemes/{schemeId}/runs")
	public JudwaaResponse<IncentiveCalculationRunResponseDTO, String> runCalculation(@PathVariable UUID schemeId) {
		return JudwaaResponse.build(incentiveService.runSchemeCalculation(schemeId), HttpStatus.CREATED.getReasonPhrase(), HttpStatus.CREATED);
	}

	@GetMapping("/schemes/{schemeId}/runs")
	public JudwaaResponse<PaginatedResponseDTO<IncentiveCalculationRunResponseDTO>, String> listRuns(@PathVariable UUID schemeId,
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size) {
		return JudwaaResponse.build(incentiveService.listRuns(schemeId, page, size), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}
}
