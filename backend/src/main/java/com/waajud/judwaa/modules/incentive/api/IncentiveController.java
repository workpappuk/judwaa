package com.waajud.judwaa.modules.incentive.api;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import com.waajud.judwaa.modules.incentive.enums.IncentiveSchemeStatus;
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
	public PaginatedResponseDTO<IncentiveSchemeResponseDTO> listSchemes(
			@RequestParam(required = false) IncentiveSchemeStatus status, @RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int size) {
		return incentiveService.listSchemes(status, page, size);
	}

	@PostMapping("/schemes")
	public ResponseEntity<IncentiveSchemeResponseDTO> createScheme(
			@RequestBody @Valid IncentiveSchemeRequestDTO request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(incentiveService.createScheme(request));
	}

	@PutMapping("/schemes/{schemeId}")
	public IncentiveSchemeResponseDTO updateScheme(@PathVariable UUID schemeId,
			@RequestBody @Valid IncentiveSchemeRequestDTO request) {
		return incentiveService.updateScheme(schemeId, request);
	}

	@GetMapping("/schemes/{schemeId}/rules")
	public PaginatedResponseDTO<IncentiveRuleResponseDTO> listRules(@PathVariable UUID schemeId,
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size) {
		return incentiveService.listRules(schemeId, page, size);
	}

	@PostMapping("/schemes/{schemeId}/rules")
	public ResponseEntity<IncentiveRuleResponseDTO> createRule(@PathVariable UUID schemeId,
			@RequestBody @Valid IncentiveRuleRequestDTO request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(incentiveService.createRule(schemeId, request));
	}

	@PutMapping("/rules/{ruleId}")
	public IncentiveRuleResponseDTO updateRule(@PathVariable UUID ruleId,
			@RequestBody @Valid IncentiveRuleRequestDTO request) {
		return incentiveService.updateRule(ruleId, request);
	}

	@DeleteMapping("/rules/{ruleId}")
	public ResponseEntity<Void> deleteRule(@PathVariable UUID ruleId) {
		incentiveService.deleteRule(ruleId);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/schemes/{schemeId}/runs")
	public ResponseEntity<IncentiveCalculationRunResponseDTO> runCalculation(@PathVariable UUID schemeId) {
		return ResponseEntity.status(HttpStatus.CREATED).body(incentiveService.runSchemeCalculation(schemeId));
	}

	@GetMapping("/schemes/{schemeId}/runs")
	public PaginatedResponseDTO<IncentiveCalculationRunResponseDTO> listRuns(@PathVariable UUID schemeId,
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size) {
		return incentiveService.listRuns(schemeId, page, size);
	}
}
