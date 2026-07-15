package com.waajud.judwaa.modules.trading.infrastructure;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waajud.judwaa.modules.trading.domain.KotakProperties;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

@ExtendWith(MockitoExtension.class)
class KotakNeoQuoteServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private KotakProperties props;

    @TempDir
    Path tempDir;

    @Test
    void fetchQuotes_encodesSymbolsAndReturnsBody() throws Exception {
        Path sessionFile = tempDir.resolve("session.json");
        Files.writeString(sessionFile, "{\"token\":\"abc\",\"baseUrl\":\"http://localhost:9090\"}");

        when(props.getSessionFile()).thenReturn(sessionFile.toString());
        when(props.getAuthorization()).thenReturn("Bearer token");

        KotakNeoQuoteService.QuoteResponse response = new KotakNeoQuoteService.QuoteResponse();
        response.exchange = "NSE";
        when(restTemplate.exchange(any(String.class), eq(HttpMethod.GET), any(), eq(KotakNeoQuoteService.QuoteResponse[].class)))
                .thenReturn(ResponseEntity.ok(new KotakNeoQuoteService.QuoteResponse[] { response }));

        KotakNeoQuoteService service = new KotakNeoQuoteService(restTemplate, props, new ObjectMapper());
        List<KotakNeoQuoteService.QuoteResponse> quotes = service.fetchQuotes(List.of("nse_cm|Nifty 50"));

        assertEquals(1, quotes.size());

        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);
        org.mockito.Mockito.verify(restTemplate)
                .exchange(urlCaptor.capture(), eq(HttpMethod.GET), any(), eq(KotakNeoQuoteService.QuoteResponse[].class));
        String url = urlCaptor.getValue();
        org.junit.jupiter.api.Assertions.assertTrue(url.contains("nse_cm%7CNifty%2050"));
    }

    @Test
    void fetchQuotes_nullBody_returnsEmptyList() throws Exception {
        Path sessionFile = tempDir.resolve("session.json");
        Files.writeString(sessionFile, "{\"token\":\"abc\",\"baseUrl\":\"http://localhost:9090\"}");

        when(props.getSessionFile()).thenReturn(sessionFile.toString());
        when(props.getAuthorization()).thenReturn("Bearer token");
        when(restTemplate.exchange(any(String.class), eq(HttpMethod.GET), any(), eq(KotakNeoQuoteService.QuoteResponse[].class)))
                .thenReturn(ResponseEntity.ok(null));

        KotakNeoQuoteService service = new KotakNeoQuoteService(restTemplate, props, new ObjectMapper());
        List<KotakNeoQuoteService.QuoteResponse> quotes = service.fetchQuotes(List.of("nse_cm|A"));

        assertEquals(0, quotes.size());
    }

    @Test
    void fetchQuotes_missingBaseUrl_throws() throws Exception {
        Path sessionFile = tempDir.resolve("session.json");
        Files.writeString(sessionFile, "{\"token\":\"abc\"}");

        when(props.getSessionFile()).thenReturn(sessionFile.toString());

        KotakNeoQuoteService service = new KotakNeoQuoteService(restTemplate, props, new ObjectMapper());

        assertThrows(RuntimeException.class, () -> service.fetchQuotes(List.of("nse_cm|A")));
    }
}
