package com.waajud.judwaa.modules.datacollector.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

import com.waajud.judwaa.modules.datacollector.dto.DataCollectorDetailResponseDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorPersistRequestDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorPersistResponseDTO;
import com.waajud.judwaa.modules.datacollector.dto.DataCollectorPersistedRecordDTO;
import com.waajud.judwaa.modules.datacollector.service.DataCollectorService;
import com.waajud.judwaa.shared.JudwaaResponse;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class DataCollectorControllerTest {

    @Mock
    private DataCollectorService service;

    private DataCollectorController controller;

    @BeforeEach
    void setUp() {
        controller = new DataCollectorController(service);
    }

    @Test
    void getCollector_notFound_returns404() {
        when(service.getCollector("x")).thenReturn(null);

        JudwaaResponse<DataCollectorDetailResponseDTO, String> response = controller.getCollector("x");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatus());
        assertNull(response.getData());
    }

    @Test
    void getCollector_found_returns200() {
        DataCollectorDetailResponseDTO dto = new DataCollectorDetailResponseDTO("id", "cat", "title", "sub",
                "btn", null, List.of(), List.of(), Map.of(), null);
        when(service.getCollector("id")).thenReturn(dto);

        JudwaaResponse<DataCollectorDetailResponseDTO, String> response = controller.getCollector("id");

        assertEquals(HttpStatus.OK, response.getStatus());
        assertNotNull(response.getData());
    }

    @Test
    void updatePersistedCollectorData_invalidPayload_returns400() {
        JudwaaResponse<Object, String> response1 = controller.updatePersistedCollectorData("id", null);
        JudwaaResponse<Object, String> response2 = controller.updatePersistedCollectorData("id",
                new DataCollectorPersistRequestDTO(null));

        assertEquals(HttpStatus.BAD_REQUEST, response1.getStatus());
        assertEquals(HttpStatus.BAD_REQUEST, response2.getStatus());
    }

    @Test
    void updatePersistedCollectorData_unknownCollector_returns404() {
        when(service.saveCollectorValues("id", Map.of("k", "v"))).thenReturn(null);

        JudwaaResponse<Object, String> response = controller.updatePersistedCollectorData("id",
                new DataCollectorPersistRequestDTO(Map.of("k", "v")));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatus());
    }

    @Test
    void updatePersistedCollectorData_missingPersistedAfterSave_returns404() {
        when(service.saveCollectorValues("id", Map.of("k", "v"))).thenReturn(new DataCollectorPersistResponseDTO("ok", "t"));
        when(service.getPersistedCollectorData("id")).thenReturn(null);

        JudwaaResponse<Object, String> response = controller.updatePersistedCollectorData("id",
                new DataCollectorPersistRequestDTO(Map.of("k", "v")));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatus());
    }

    @Test
    void updatePersistedCollectorData_success_returns200() {
        DataCollectorPersistedRecordDTO persisted = new DataCollectorPersistedRecordDTO("id", Map.of("k", "v"), "t");
        when(service.saveCollectorValues("id", Map.of("k", "v"))).thenReturn(new DataCollectorPersistResponseDTO("ok", "t"));
        when(service.getPersistedCollectorData("id")).thenReturn(persisted);

        JudwaaResponse<Object, String> response = controller.updatePersistedCollectorData("id",
                new DataCollectorPersistRequestDTO(Map.of("k", "v")));

        assertEquals(HttpStatus.OK, response.getStatus());
        assertNotNull(response.getData());
    }

    @Test
    void persistCollector_paths() {
        JudwaaResponse<Object, String> invalid = controller.persistCollector("id", null);
        assertEquals(HttpStatus.BAD_REQUEST, invalid.getStatus());

        when(service.saveCollectorValues("id", Map.of("k", "v"))).thenReturn(null);
        JudwaaResponse<Object, String> notFound = controller.persistCollector("id",
                new DataCollectorPersistRequestDTO(Map.of("k", "v")));
        assertEquals(HttpStatus.NOT_FOUND, notFound.getStatus());

        when(service.saveCollectorValues("id", Map.of("k", "v"))).thenReturn(new DataCollectorPersistResponseDTO("saved", "t"));
        JudwaaResponse<Object, String> ok = controller.persistCollector("id",
                new DataCollectorPersistRequestDTO(Map.of("k", "v")));
        assertEquals(HttpStatus.OK, ok.getStatus());
    }

    @Test
    void listEndpoints_returnOk() {
        when(service.listCollectors()).thenReturn(List.of());
        when(service.listPersistedCollectorData()).thenReturn(List.of());

        assertEquals(HttpStatus.OK, controller.listCollectors().getStatus());
        assertEquals(HttpStatus.OK, controller.listPersistedCollectorData().getStatus());
    }

    @Test
    void getPersistedCollector_paths() {
        when(service.getPersistedCollectorData("id")).thenReturn(null);
        assertEquals(HttpStatus.NOT_FOUND, controller.getPersistedCollectorData("id").getStatus());

        when(service.getPersistedCollectorData("id"))
                .thenReturn(new DataCollectorPersistedRecordDTO("id", Map.of("k", "v"), "t"));
        assertEquals(HttpStatus.OK, controller.getPersistedCollectorData("id").getStatus());
    }
}
