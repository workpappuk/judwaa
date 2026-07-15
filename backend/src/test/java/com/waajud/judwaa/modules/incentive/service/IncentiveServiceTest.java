package com.waajud.judwaa.modules.incentive.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.waajud.judwaa.modules.incentive.dto.request.IncentiveRuleRequestDTO;
import com.waajud.judwaa.modules.incentive.dto.request.IncentiveSchemeRequestDTO;
import com.waajud.judwaa.modules.incentive.dto.response.IncentiveCalculationRunResponseDTO;
import com.waajud.judwaa.modules.incentive.dto.response.IncentiveRuleResponseDTO;
import com.waajud.judwaa.modules.incentive.dto.response.IncentiveSchemeResponseDTO;
import com.waajud.judwaa.modules.incentive.dto.response.PaginatedResponseDTO;
import com.waajud.judwaa.modules.incentive.entity.IncentiveCalculationRun;
import com.waajud.judwaa.modules.incentive.entity.IncentiveRule;
import com.waajud.judwaa.modules.incentive.entity.IncentiveScheme;
import com.waajud.judwaa.modules.incentive.enums.IncentiveConflictStrategy;
import com.waajud.judwaa.modules.incentive.enums.IncentiveRuleType;
import com.waajud.judwaa.modules.incentive.repository.IncentiveCalculationRunRepository;
import com.waajud.judwaa.modules.incentive.repository.IncentiveRuleRepository;
import com.waajud.judwaa.modules.incentive.repository.IncentiveSchemeRepository;
import com.waajud.judwaa.shared.RecordStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class IncentiveServiceTest {

    @Mock
    private IncentiveSchemeRepository schemeRepository;

    @Mock
    private IncentiveRuleRepository ruleRepository;

    @Mock
    private IncentiveCalculationRunRepository runRepository;

    @InjectMocks
    private IncentiveService service;

    private IncentiveSchemeRequestDTO schemeRequest;
    private IncentiveRuleRequestDTO ruleRequest;

    @BeforeEach
    void setUp() {
        schemeRequest = new IncentiveSchemeRequestDTO();
        schemeRequest.setName("  Growth Scheme ");
        schemeRequest.setDescription("  desc ");
        schemeRequest.setStatus(RecordStatus.ACTIVE);
        schemeRequest.setStartDate(LocalDate.parse("2026-07-01"));
        schemeRequest.setEndDate(LocalDate.parse("2026-12-31"));

        ruleRequest = new IncentiveRuleRequestDTO();
        ruleRequest.setName("  Rule 1 ");
        ruleRequest.setType(IncentiveRuleType.GROWTH);
        ruleRequest.setPriority(0);
        ruleRequest.setStatus(RecordStatus.ACTIVE);
        ruleRequest.setConflictStrategy(IncentiveConflictStrategy.ADDITIVE);
        ruleRequest.setConditionsJson("{}");
        ruleRequest.setSlabsJson("[]");
    }

    @Test
    void listSchemes_withoutStatus_usesFindAllWithNormalizedPaging() {
        IncentiveScheme scheme = new IncentiveScheme();
        scheme.setId(UUID.randomUUID());
        scheme.setName("S");
        Page<IncentiveScheme> page = new PageImpl<>(List.of(scheme));
        when(schemeRepository.findAll(any(Pageable.class))).thenReturn(page);

        PaginatedResponseDTO<IncentiveSchemeResponseDTO> response = service.listSchemes(null, 0, 999);

        assertEquals(1, response.getContent().size());
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(schemeRepository).findAll(captor.capture());
        assertEquals(0, captor.getValue().getPageNumber());
        assertEquals(200, captor.getValue().getPageSize());
    }

    @Test
    void listSchemes_withStatus_usesFindByStatus() {
        when(schemeRepository.findByStatus(any(RecordStatus.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        service.listSchemes(RecordStatus.ACTIVE, 1, 10);

        verify(schemeRepository).findByStatus(any(RecordStatus.class), any(Pageable.class));
    }

    @Test
    void createScheme_setsDefaultsAndTrims() {
        when(schemeRepository.save(any(IncentiveScheme.class))).thenAnswer(invocation -> {
            IncentiveScheme saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        IncentiveSchemeResponseDTO response = service.createScheme(schemeRequest);

        assertEquals("Growth Scheme", response.getName());
        assertEquals("desc", response.getDescription());
        assertEquals(1, response.getVersion());
        assertEquals(0, response.getTotalRules());
    }

    @Test
    void updateScheme_incrementsVersion() {
        UUID schemeId = UUID.randomUUID();
        IncentiveScheme existing = new IncentiveScheme();
        existing.setId(schemeId);
        existing.setVersion(4);
        when(schemeRepository.findById(schemeId)).thenReturn(Optional.of(existing));
        when(schemeRepository.save(any(IncentiveScheme.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IncentiveSchemeResponseDTO response = service.updateScheme(schemeId, schemeRequest);

        assertEquals(5, response.getVersion());
    }

    @Test
    void listRules_schemeMissing_throwsNotFound() {
        UUID schemeId = UUID.randomUUID();
        when(schemeRepository.existsById(schemeId)).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.listRules(schemeId, 1, 10));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void createRule_updatesSchemeMeta() {
        UUID schemeId = UUID.randomUUID();
        IncentiveScheme scheme = new IncentiveScheme();
        scheme.setId(schemeId);
        scheme.setVersion(1);
        when(schemeRepository.findById(schemeId)).thenReturn(Optional.of(scheme));
        when(ruleRepository.save(any(IncentiveRule.class))).thenAnswer(invocation -> {
            IncentiveRule rule = invocation.getArgument(0);
            rule.setId(UUID.randomUUID());
            return rule;
        });
        when(ruleRepository.countBySchemeId(schemeId)).thenReturn(3L);

        IncentiveRuleResponseDTO response = service.createRule(schemeId, ruleRequest);

        assertNotNull(response.getId());
        assertEquals(schemeId, response.getSchemeId());
        verify(schemeRepository).save(any(IncentiveScheme.class));
    }

    @Test
    void runSchemeCalculation_persistsRunAndUpdatesScheme() {
        UUID schemeId = UUID.randomUUID();
        IncentiveScheme scheme = new IncentiveScheme();
        scheme.setId(schemeId);
        scheme.setVersion(2);
        when(schemeRepository.findById(schemeId)).thenReturn(Optional.of(scheme));
        when(ruleRepository.countBySchemeId(schemeId)).thenReturn(2L);
        when(runRepository.save(any(IncentiveCalculationRun.class))).thenAnswer(invocation -> {
            IncentiveCalculationRun run = invocation.getArgument(0);
            run.setId(UUID.randomUUID());
            return run;
        });

        IncentiveCalculationRunResponseDTO response = service.runSchemeCalculation(schemeId);

        assertEquals(schemeId, response.getSchemeId());
        assertEquals(240L * 2L * 750L, response.getTotalPayout());
        verify(schemeRepository).save(any(IncentiveScheme.class));
    }

    @Test
    void listRuns_schemeMissing_throwsNotFound() {
        UUID schemeId = UUID.randomUUID();
        when(schemeRepository.existsById(schemeId)).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.listRuns(schemeId, 1, 10));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void listRules_success() {
        UUID schemeId = UUID.randomUUID();
        IncentiveScheme scheme = new IncentiveScheme();
        scheme.setId(schemeId);
        IncentiveRule rule = new IncentiveRule();
        rule.setId(UUID.randomUUID());
        rule.setScheme(scheme);
        rule.setName("Rule");
        rule.setPriority(1);
        rule.setStatus(RecordStatus.ACTIVE);
        when(schemeRepository.existsById(schemeId)).thenReturn(true);
        when(ruleRepository.findBySchemeId(any(UUID.class), any(Pageable.class))).thenReturn(new PageImpl<>(List.of(rule)));

        PaginatedResponseDTO<IncentiveRuleResponseDTO> response = service.listRules(schemeId, 1, 10);

        assertEquals(1, response.getContent().size());
    }

    @Test
    void updateRule_andDeleteRule_success() {
        UUID schemeId = UUID.randomUUID();
        UUID ruleId = UUID.randomUUID();
        IncentiveScheme scheme = new IncentiveScheme();
        scheme.setId(schemeId);
        scheme.setVersion(1);
        IncentiveRule rule = new IncentiveRule();
        rule.setId(ruleId);
        rule.setScheme(scheme);
        when(ruleRepository.findById(ruleId)).thenReturn(Optional.of(rule));
        when(ruleRepository.save(any(IncentiveRule.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(ruleRepository.countBySchemeId(schemeId)).thenReturn(2L, 1L);

        IncentiveRuleRequestDTO updateRequest = new IncentiveRuleRequestDTO();
        updateRequest.setName("Rule Updated");
        updateRequest.setType(IncentiveRuleType.TARGET);
        updateRequest.setPriority(5);
        updateRequest.setStatus(RecordStatus.ACTIVE);
        updateRequest.setConflictStrategy(IncentiveConflictStrategy.PRIORITY);
        updateRequest.setConditionsJson("{}");
        updateRequest.setSlabsJson("[]");

        IncentiveRuleResponseDTO response = service.updateRule(ruleId, updateRequest);
        assertEquals(5, response.getPriority());

        service.deleteRule(ruleId);
        verify(ruleRepository).delete(rule);
        verify(schemeRepository, org.mockito.Mockito.atLeastOnce()).save(any(IncentiveScheme.class));
    }

    @Test
    void runSchemeCalculation_withNoRules_usesMinimumDistributors() {
        UUID schemeId = UUID.randomUUID();
        IncentiveScheme scheme = new IncentiveScheme();
        scheme.setId(schemeId);
        scheme.setVersion(1);
        when(schemeRepository.findById(schemeId)).thenReturn(Optional.of(scheme));
        when(ruleRepository.countBySchemeId(schemeId)).thenReturn(0L);
        when(runRepository.save(any(IncentiveCalculationRun.class))).thenAnswer(invocation -> {
            IncentiveCalculationRun run = invocation.getArgument(0);
            run.setId(UUID.randomUUID());
            return run;
        });

        IncentiveCalculationRunResponseDTO response = service.runSchemeCalculation(schemeId);

        assertEquals(25L, response.getDistributors());
        assertEquals(25L * 1L * 750L, response.getTotalPayout());
    }

    @Test
    void listRuns_success() {
        UUID schemeId = UUID.randomUUID();
        IncentiveScheme scheme = new IncentiveScheme();
        scheme.setId(schemeId);
        IncentiveCalculationRun run = new IncentiveCalculationRun();
        run.setId(UUID.randomUUID());
        run.setScheme(scheme);
        run.setStatus(RecordStatus.COMPLETED);
        when(schemeRepository.existsById(schemeId)).thenReturn(true);
        when(runRepository.findBySchemeId(any(UUID.class), any(Pageable.class))).thenReturn(new PageImpl<>(List.of(run)));

        PaginatedResponseDTO<IncentiveCalculationRunResponseDTO> response = service.listRuns(schemeId, 1, 10);

        assertEquals(1, response.getContent().size());
    }

    @Test
    void updateScheme_missing_throwsNotFound() {
        UUID schemeId = UUID.randomUUID();
        when(schemeRepository.findById(schemeId)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.updateScheme(schemeId, schemeRequest));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }
}
