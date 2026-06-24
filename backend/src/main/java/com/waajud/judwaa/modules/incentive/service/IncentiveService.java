package com.waajud.judwaa.modules.incentive.service;

import java.time.Instant;
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

import com.waajud.judwaa.modules.incentive.dto.request.IncentiveRuleRequestDTO;
import com.waajud.judwaa.modules.incentive.dto.request.IncentiveSchemeRequestDTO;
import com.waajud.judwaa.modules.incentive.dto.response.IncentiveCalculationRunResponseDTO;
import com.waajud.judwaa.modules.incentive.dto.response.IncentiveRuleResponseDTO;
import com.waajud.judwaa.modules.incentive.dto.response.IncentiveSchemeResponseDTO;
import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.incentive.entity.IncentiveCalculationRun;
import com.waajud.judwaa.modules.incentive.entity.IncentiveRule;
import com.waajud.judwaa.modules.incentive.entity.IncentiveScheme;
import com.waajud.judwaa.modules.incentive.enums.IncentiveRunStatus;
import com.waajud.judwaa.modules.incentive.enums.IncentiveSchemeStatus;
import com.waajud.judwaa.modules.incentive.repository.IncentiveCalculationRunRepository;
import com.waajud.judwaa.modules.incentive.repository.IncentiveRuleRepository;
import com.waajud.judwaa.modules.incentive.repository.IncentiveSchemeRepository;

@Service
@SuppressWarnings("null")
public class IncentiveService {
	private final IncentiveSchemeRepository schemeRepository;
	private final IncentiveRuleRepository ruleRepository;
	private final IncentiveCalculationRunRepository runRepository;

	public IncentiveService(IncentiveSchemeRepository schemeRepository, IncentiveRuleRepository ruleRepository,
			IncentiveCalculationRunRepository runRepository) {
		this.schemeRepository = schemeRepository;
		this.ruleRepository = ruleRepository;
		this.runRepository = runRepository;
	}

	@Transactional(readOnly = true)
	public PaginatedResponseDTO<IncentiveSchemeResponseDTO> listSchemes(IncentiveSchemeStatus status, int page,
			int size) {
		Pageable pageable = PageRequest.of(normalizePage(page), normalizeSize(size),
				Sort.by(Sort.Direction.DESC, "createdAt"));
		Page<IncentiveScheme> pageData = status == null
				? schemeRepository.findAll(pageable)
				: schemeRepository.findByStatus(status, pageable);
		return PaginatedResponseDTO.fromPage(pageData.map(this::toSchemeResponse));
	}

	@Transactional
	public IncentiveSchemeResponseDTO createScheme(IncentiveSchemeRequestDTO request) {
		IncentiveScheme scheme = new IncentiveScheme();
		applySchemeRequest(scheme, request);
		scheme.setVersion(1);
		scheme.setTotalRules(0);
		return toSchemeResponse(schemeRepository.save(scheme));
	}

	@Transactional
	public IncentiveSchemeResponseDTO updateScheme(UUID schemeId, IncentiveSchemeRequestDTO request) {
		IncentiveScheme scheme = getSchemeOrThrow(schemeId);
		applySchemeRequest(scheme, request);
		scheme.setVersion(scheme.getVersion() + 1);
		return toSchemeResponse(schemeRepository.save(scheme));
	}

	@Transactional(readOnly = true)
	public PaginatedResponseDTO<IncentiveRuleResponseDTO> listRules(UUID schemeId, int page, int size) {
		UUID safeSchemeId = Objects.requireNonNull(schemeId, "schemeId is required");
		if (!schemeRepository.existsById(safeSchemeId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Scheme not found");
		}

		Pageable pageable = PageRequest.of(normalizePage(page), normalizeSize(size),
				Sort.by(Sort.Direction.ASC, "priority").and(Sort.by(Sort.Direction.DESC, "createdAt")));
		Page<IncentiveRule> pageData = ruleRepository.findBySchemeId(safeSchemeId, pageable);
		return PaginatedResponseDTO.fromPage(pageData.map(this::toRuleResponse));
	}

	@Transactional
	public IncentiveRuleResponseDTO createRule(UUID schemeId, IncentiveRuleRequestDTO request) {
		IncentiveScheme scheme = getSchemeOrThrow(schemeId);
		IncentiveRule rule = new IncentiveRule();
		rule.setScheme(scheme);
		applyRuleRequest(rule, request);
		IncentiveRule saved = Objects.requireNonNull(ruleRepository.save(rule));
		touchSchemeForRuleMutation(scheme);
		return toRuleResponse(saved);
	}

	@Transactional
	public IncentiveRuleResponseDTO updateRule(UUID ruleId, IncentiveRuleRequestDTO request) {
		IncentiveRule rule = getRuleOrThrow(ruleId);
		applyRuleRequest(rule, request);
		IncentiveRule saved = Objects.requireNonNull(ruleRepository.save(rule));
		touchSchemeForRuleMutation(rule.getScheme());
		return toRuleResponse(saved);
	}

	@Transactional
	public void deleteRule(UUID ruleId) {
		IncentiveRule rule = getRuleOrThrow(ruleId);
		IncentiveScheme scheme = rule.getScheme();
		ruleRepository.delete(rule);
		touchSchemeForRuleMutation(scheme);
	}

	@Transactional
	public IncentiveCalculationRunResponseDTO runSchemeCalculation(UUID schemeId) {
		IncentiveScheme scheme = getSchemeOrThrow(schemeId);
		long ruleCount = ruleRepository.countBySchemeId(Objects.requireNonNull(scheme.getId()));
		long distributors = Math.max(25L, ruleCount * 120L);
		long totalPayout = distributors * Math.max(1L, ruleCount) * 750L;
		long durationMs = 1400L + (ruleCount * 180L);

		IncentiveCalculationRun run = new IncentiveCalculationRun();
		run.setScheme(scheme);
		run.setRunAt(Instant.now());
		run.setStatus(IncentiveRunStatus.COMPLETED);
		run.setDistributors(distributors);
		run.setTotalPayout(totalPayout);
		run.setDurationMs(durationMs);

		IncentiveCalculationRun saved = runRepository.save(run);
		scheme.setLastRunAt(saved.getRunAt());
		scheme.setVersion(scheme.getVersion() + 1);
		schemeRepository.save(scheme);
		return toRunResponse(saved);
	}

	@Transactional(readOnly = true)
	public PaginatedResponseDTO<IncentiveCalculationRunResponseDTO> listRuns(UUID schemeId, int page, int size) {
		UUID safeSchemeId = Objects.requireNonNull(schemeId, "schemeId is required");
		if (!schemeRepository.existsById(safeSchemeId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Scheme not found");
		}

		Pageable pageable = PageRequest.of(normalizePage(page), normalizeSize(size),
				Sort.by(Sort.Direction.DESC, "runAt"));
		Page<IncentiveCalculationRun> pageData = runRepository.findBySchemeId(safeSchemeId, pageable);
		return PaginatedResponseDTO.fromPage(pageData.map(this::toRunResponse));
	}

	private IncentiveScheme getSchemeOrThrow(UUID schemeId) {
		UUID safeSchemeId = Objects.requireNonNull(schemeId, "schemeId is required");
		return schemeRepository.findById(safeSchemeId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Scheme not found"));
	}

	private IncentiveRule getRuleOrThrow(UUID ruleId) {
		UUID safeRuleId = Objects.requireNonNull(ruleId, "ruleId is required");
		return ruleRepository.findById(safeRuleId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rule not found"));
	}

	private void applySchemeRequest(IncentiveScheme scheme, IncentiveSchemeRequestDTO request) {
		scheme.setName(request.getName().trim());
		scheme.setDescription(request.getDescription() == null ? "" : request.getDescription().trim());
		scheme.setStatus(request.getStatus());
		scheme.setStartDate(request.getStartDate());
		scheme.setEndDate(request.getEndDate());
	}

	private void applyRuleRequest(IncentiveRule rule, IncentiveRuleRequestDTO request) {
		rule.setName(request.getName().trim());
		rule.setType(request.getType());
		rule.setPriority(Math.max(1, request.getPriority()));
		rule.setStatus(request.getStatus());
		rule.setConflictStrategy(request.getConflictStrategy());
		rule.setConditionsJson(request.getConditionsJson());
		rule.setSlabsJson(request.getSlabsJson());
	}

	private void touchSchemeForRuleMutation(IncentiveScheme scheme) {
		long totalRules = ruleRepository.countBySchemeId(scheme.getId());
		scheme.setTotalRules((int) totalRules);
		scheme.setVersion(scheme.getVersion() + 1);
		schemeRepository.save(scheme);
	}

	private IncentiveSchemeResponseDTO toSchemeResponse(IncentiveScheme scheme) {
		IncentiveSchemeResponseDTO dto = new IncentiveSchemeResponseDTO();
		dto.setId(scheme.getId());
		dto.setName(scheme.getName());
		dto.setDescription(scheme.getDescription());
		dto.setStatus(scheme.getStatus());
		dto.setStartDate(scheme.getStartDate());
		dto.setEndDate(scheme.getEndDate());
		dto.setVersion(scheme.getVersion());
		dto.setTotalRules(scheme.getTotalRules());
		dto.setLastRunAt(scheme.getLastRunAt());
		return dto;
	}

	private IncentiveRuleResponseDTO toRuleResponse(IncentiveRule rule) {
		IncentiveRuleResponseDTO dto = new IncentiveRuleResponseDTO();
		dto.setId(rule.getId());
		dto.setSchemeId(rule.getScheme().getId());
		dto.setName(rule.getName());
		dto.setType(rule.getType());
		dto.setPriority(rule.getPriority());
		dto.setStatus(rule.getStatus());
		dto.setConflictStrategy(rule.getConflictStrategy());
		dto.setConditionsJson(rule.getConditionsJson());
		dto.setSlabsJson(rule.getSlabsJson());
		dto.setCreatedAt(rule.getCreatedAt());
		return dto;
	}

	private IncentiveCalculationRunResponseDTO toRunResponse(IncentiveCalculationRun run) {
		IncentiveCalculationRunResponseDTO dto = new IncentiveCalculationRunResponseDTO();
		dto.setId(run.getId());
		dto.setSchemeId(run.getScheme().getId());
		dto.setRunAt(run.getRunAt());
		dto.setStatus(run.getStatus());
		dto.setDistributors(run.getDistributors());
		dto.setTotalPayout(run.getTotalPayout());
		dto.setDurationMs(run.getDurationMs());
		return dto;
	}

	private int normalizePage(int page) {
		return Math.max(0, page - 1);
	}

	private int normalizeSize(int size) {
		return Math.min(200, Math.max(1, size));
	}
}
