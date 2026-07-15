package com.waajud.judwaa.modules.datacollector.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorDetailResponseDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorPersistResponseDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorPersistedRecordDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorSummaryResponseDTO;
import com.waajud.judwaa.modules.datacollector.entity.DataCollectorState;
import com.waajud.judwaa.modules.datacollector.repository.DataCollectorStateRepository;
import com.waajud.judwaa.modules.datacollector.seeder.DataCollectorDefinitionSeeder;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DataCollectorServiceTest {

    @Mock
    private DataCollectorStateRepository stateRepository;

    private DataCollectorService service;

    @BeforeEach
    void setUp() {
        service = new DataCollectorService(new ObjectMapper(), stateRepository, new DataCollectorDefinitionSeeder());
    }

    @Test
    void listCollectors_returnsSeededCollectors() {
        when(stateRepository.findById(any(String.class))).thenReturn(Optional.empty());

        List<DataCollectorSummaryResponseDTO> result = service.listCollectors();

        assertEquals(4, result.size());
        assertTrue(result.stream().anyMatch(item -> "tenant-onboarding".equals(item.id())));
    }

    @Test
    void listCollectors_includesUpdatedAtWhenPresent() {
        DataCollectorState state = new DataCollectorState();
        state.setCollectorId("tenant-onboarding");
        state.setUpdatedAt(Instant.parse("2026-07-15T08:00:00Z"));
        when(stateRepository.findById(any(String.class))).thenReturn(Optional.empty());
        when(stateRepository.findById("tenant-onboarding")).thenReturn(Optional.of(state));

        List<DataCollectorSummaryResponseDTO> result = service.listCollectors();

        DataCollectorSummaryResponseDTO onboarding = result.stream()
                .filter(item -> "tenant-onboarding".equals(item.id()))
                .findFirst()
                .orElseThrow();
        assertEquals("2026-07-15T08:00:00Z", onboarding.updatedAt());
    }

    @Test
    void getCollector_unknownCollector_returnsNull() {
        DataCollectorDetailResponseDTO result = service.getCollector("unknown");

        assertNull(result);
    }

    @Test
    void getCollector_knownCollectorWithoutState_returnsEmptyPersistedValues() {
        when(stateRepository.findById("tenant-onboarding")).thenReturn(Optional.empty());

        DataCollectorDetailResponseDTO result = service.getCollector("tenant-onboarding");

        assertNotNull(result);
        assertTrue(result.persistedValues().isEmpty());
    }

    @Test
    void getCollector_handlesInvalidStoredJson() {
        DataCollectorState state = new DataCollectorState();
        state.setCollectorId("tenant-onboarding");
        state.setValuesJson("{bad json");
        state.setUpdatedAt(Instant.parse("2026-07-14T08:00:00Z"));
        when(stateRepository.findById("tenant-onboarding")).thenReturn(Optional.of(state));

        DataCollectorDetailResponseDTO result = service.getCollector("tenant-onboarding");

        assertNotNull(result);
        assertEquals("tenant-onboarding", result.id());
        assertTrue(result.persistedValues().isEmpty());
        assertEquals("2026-07-14T08:00:00Z", result.updatedAt());
    }

    @Test
    void getCollector_withValidStoredJson_returnsValues() {
        DataCollectorState state = new DataCollectorState();
        state.setCollectorId("tenant-onboarding");
        state.setValuesJson("{\"enabled\":true,\"name\":\"alpha\"}");
        when(stateRepository.findById("tenant-onboarding")).thenReturn(Optional.of(state));

        DataCollectorDetailResponseDTO result = service.getCollector("tenant-onboarding");

        assertEquals(true, result.persistedValues().get("enabled"));
        assertEquals("alpha", result.persistedValues().get("name"));
    }

    @Test
    void listPersistedCollectorData_mapsStoredValues() {
        DataCollectorState state = new DataCollectorState();
        state.setCollectorId("equity-daily");
        state.setValuesJson("{\"enabled\":true,\"batch\":10}");
        state.setUpdatedAt(Instant.parse("2026-07-14T09:30:00Z"));
        when(stateRepository.findAll()).thenReturn(List.of(state));

        List<DataCollectorPersistedRecordDTO> result = service.listPersistedCollectorData();

        assertEquals(1, result.size());
        assertEquals("equity-daily", result.get(0).collectorId());
        assertEquals(true, result.get(0).values().get("enabled"));
    }

    @Test
    void listPersistedCollectorData_withBlankJsonAndNoUpdatedAt_returnsEmptyValues() {
        DataCollectorState state = new DataCollectorState();
        state.setCollectorId("equity-daily");
        state.setValuesJson("   ");
        state.setUpdatedAt(null);
        when(stateRepository.findAll()).thenReturn(List.of(state));

        List<DataCollectorPersistedRecordDTO> result = service.listPersistedCollectorData();

        assertEquals(1, result.size());
        assertTrue(result.get(0).values().isEmpty());
        assertEquals(null, result.get(0).updatedAt());
    }

    @Test
    void getPersistedCollectorData_notFound_returnsNull() {
        when(stateRepository.findById("equity-daily")).thenReturn(Optional.empty());

        DataCollectorPersistedRecordDTO result = service.getPersistedCollectorData("equity-daily");

        assertNull(result);
    }

    @Test
    void getPersistedCollectorData_found_returnsValues() {
        DataCollectorState state = new DataCollectorState();
        state.setCollectorId("equity-daily");
        state.setValuesJson("{\"name\":\"test\"}");
        state.setUpdatedAt(Instant.parse("2026-07-14T11:00:00Z"));
        when(stateRepository.findById("equity-daily")).thenReturn(Optional.of(state));

        DataCollectorPersistedRecordDTO result = service.getPersistedCollectorData("equity-daily");

        assertEquals("equity-daily", result.collectorId());
        assertEquals("test", result.values().get("name"));
    }

    @Test
    void saveCollectorValues_unknownCollector_returnsNull() {
        DataCollectorPersistResponseDTO result = service.saveCollectorValues("unknown", Map.of("a", 1));

        assertNull(result);
    }

    @Test
    void saveCollectorValues_sanitizesAndPersists() {
        when(stateRepository.findById("tenant-onboarding")).thenReturn(Optional.empty());
        when(stateRepository.save(any(DataCollectorState.class))).thenAnswer(invocation -> {
            DataCollectorState state = invocation.getArgument(0);
            state.setUpdatedAt(Instant.parse("2026-07-14T10:00:00Z"));
            return state;
        });

        Map<String, Object> payload = Map.of(
                "text", "v",
                "num", 2,
                "bool", true,
                "ignored", Map.of("nested", "x"));

        DataCollectorPersistResponseDTO response = service.saveCollectorValues("tenant-onboarding", payload);

        assertEquals("Collector data saved", response.message());

        ArgumentCaptor<DataCollectorState> captor = ArgumentCaptor.forClass(DataCollectorState.class);
        verify(stateRepository).save(captor.capture());
        String json = captor.getValue().getValuesJson();
        assertTrue(json.contains("text"));
        assertTrue(json.contains("num"));
        assertTrue(json.contains("bool"));
        assertTrue(!json.contains("ignored"));
    }

    @Test
    void saveCollectorValues_withNullPayload_persistsEmptyObject() {
        when(stateRepository.findById("tenant-onboarding")).thenReturn(Optional.empty());
        when(stateRepository.save(any(DataCollectorState.class))).thenAnswer(invocation -> {
            DataCollectorState state = invocation.getArgument(0);
            state.setUpdatedAt(Instant.parse("2026-07-14T12:00:00Z"));
            return state;
        });

        DataCollectorPersistResponseDTO response = service.saveCollectorValues("tenant-onboarding", null);

        assertEquals("Collector data saved", response.message());
    }

    @Test
    void saveCollectorValues_whenSerializationFails_throwsRuntime() throws Exception {
        ObjectMapper failingMapper = org.mockito.Mockito.mock(ObjectMapper.class);
        when(stateRepository.findById("tenant-onboarding")).thenReturn(Optional.empty());
        when(failingMapper.writeValueAsString(any(Map.class))).thenThrow(new RuntimeException("boom"));
        DataCollectorService failingService = new DataCollectorService(failingMapper, stateRepository,
                new DataCollectorDefinitionSeeder());

        assertThrows(RuntimeException.class,
                () -> failingService.saveCollectorValues("tenant-onboarding", Map.of("k", "v")));
    }
}
