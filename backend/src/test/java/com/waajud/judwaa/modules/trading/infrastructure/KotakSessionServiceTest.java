package com.waajud.judwaa.modules.trading.infrastructure;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waajud.judwaa.modules.trading.domain.KotakProperties;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@ExtendWith(MockitoExtension.class)
class KotakSessionServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private KotakProperties props;

    @TempDir
    Path tempDir;

    @SuppressWarnings({ "rawtypes", "unchecked" })
    @Test
    void activateTradeSession_success_writesSessionFile() throws Exception {
        Path sessionPath = tempDir.resolve("state/session.json");

        when(props.getLoginUrl()).thenReturn("http://localhost:9090");
        when(props.getAuthorization()).thenReturn("Bearer token");
        when(props.getMobileNumber()).thenReturn("9999999999");
        when(props.getUcc()).thenReturn("UCC");
        when(props.getMpin()).thenReturn("1234");
        when(props.getSessionFile()).thenReturn(sessionPath.toString());

        Map<String, Object> loginResp = Map.of("data", Map.of("token", "view-token", "sid", "sid-1"));
        Map<String, Object> validateResp = Map.of("data", Map.of("token", "trade-token", "baseUrl", "http://base"));

        when(restTemplate.exchange(eq("http://localhost:9090/tradeApiLogin"), eq(HttpMethod.POST), any(), eq(Map.class)))
                .thenReturn(ResponseEntity.ok((Map) loginResp));
        when(restTemplate.exchange(eq("http://localhost:9090/tradeApiValidate"), eq(HttpMethod.POST), any(), eq(Map.class)))
                .thenReturn(ResponseEntity.ok((Map) validateResp));

        KotakSessionService service = new KotakSessionService(restTemplate, props, new ObjectMapper());
        Map<String, Object> result = service.activateTradeSession("654321");

        assertEquals("trade-token", result.get("token"));
        assertNotNull(Files.readString(sessionPath));
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    @Test
    void activateTradeSession_missingData_throws() {
        when(props.getLoginUrl()).thenReturn("http://localhost:9090");
        when(props.getAuthorization()).thenReturn("Bearer token");
        when(props.getMobileNumber()).thenReturn("9999999999");
        when(props.getUcc()).thenReturn("UCC");

        when(restTemplate.exchange(eq("http://localhost:9090/tradeApiLogin"), eq(HttpMethod.POST), any(), eq(Map.class)))
                .thenReturn(ResponseEntity.ok((Map) Map.of("x", "y")));

        KotakSessionService service = new KotakSessionService(restTemplate, props, new ObjectMapper());

        assertThrows(RuntimeException.class, () -> service.activateTradeSession("654321"));
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    @Test
    void activateTradeSession_httpError_isWrapped() {
        when(props.getLoginUrl()).thenReturn("http://localhost:9090");
        when(props.getAuthorization()).thenReturn("Bearer token");
        when(props.getMobileNumber()).thenReturn("9999999999");
        when(props.getUcc()).thenReturn("UCC");

        when(restTemplate.exchange(eq("http://localhost:9090/tradeApiLogin"), eq(HttpMethod.POST), any(), eq(Map.class)))
                .thenThrow(new HttpClientErrorException(HttpStatus.UNAUTHORIZED, "unauthorized"));

        KotakSessionService service = new KotakSessionService(restTemplate, props, new ObjectMapper());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> service.activateTradeSession("654321"));
        assertTrue(exception.getMessage().startsWith("HTTP 401"));
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    @Test
    void activateTradeSession_whenSessionWriteFails_throwsRuntime() {
        when(props.getLoginUrl()).thenReturn("http://localhost:9090");
        when(props.getAuthorization()).thenReturn("Bearer token");
        when(props.getMobileNumber()).thenReturn("9999999999");
        when(props.getUcc()).thenReturn("UCC");
        when(props.getMpin()).thenReturn("1234");
        when(props.getSessionFile()).thenReturn("session.json");

        Map<String, Object> loginResp = Map.of("data", Map.of("token", "view-token", "sid", "sid-1"));
        Map<String, Object> validateResp = Map.of("data", Map.of("token", "trade-token", "baseUrl", "http://base"));

        when(restTemplate.exchange(eq("http://localhost:9090/tradeApiLogin"), eq(HttpMethod.POST), any(), eq(Map.class)))
                .thenReturn(ResponseEntity.ok((Map) loginResp));
        when(restTemplate.exchange(eq("http://localhost:9090/tradeApiValidate"), eq(HttpMethod.POST), any(), eq(Map.class)))
                .thenReturn(ResponseEntity.ok((Map) validateResp));

        KotakSessionService service = new KotakSessionService(restTemplate, props, new ObjectMapper());

        assertThrows(RuntimeException.class, () -> service.activateTradeSession("654321"));
    }

        @SuppressWarnings({ "rawtypes", "unchecked" })
        @Test
        void activateTradeSession_nullBody_throws() {
                when(props.getLoginUrl()).thenReturn("http://localhost:9090");
                when(props.getAuthorization()).thenReturn("Bearer token");
                when(props.getMobileNumber()).thenReturn("9999999999");
                when(props.getUcc()).thenReturn("UCC");

                when(restTemplate.exchange(eq("http://localhost:9090/tradeApiLogin"), eq(HttpMethod.POST), any(), eq(Map.class)))
                                .thenReturn(ResponseEntity.ok((Map) null));

                KotakSessionService service = new KotakSessionService(restTemplate, props, new ObjectMapper());

                assertThrows(RuntimeException.class, () -> service.activateTradeSession("654321"));
        }
}
