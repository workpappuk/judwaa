package com.waajud.judwaa.modules.trading.infrastructure;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waajud.judwaa.modules.trading.domain.KotakProperties;
import java.io.ByteArrayInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.web.client.ResponseExtractor;
import org.springframework.web.client.RestTemplate;

@ExtendWith(MockitoExtension.class)
class ScripMasterDownloadServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private KotakProperties props;

    @TempDir
    Path tempDir;

    @Test
    void downloadAll_downloadsAndSkipsExistingFiles() throws Exception {
        Path sessionFile = tempDir.resolve("session.json");
        Path downloadRoot = tempDir.resolve("downloads");
        Files.writeString(sessionFile, "{\"token\":\"abc\",\"baseUrl\":\"http://localhost:9090\"}");

        when(props.getSessionFile()).thenReturn(sessionFile.toString());
        when(props.getDownloadRoot()).thenReturn(downloadRoot.toString());
        when(props.getFilePathsEndpoint()).thenReturn("/scrip-paths");
        when(props.getAuthorization()).thenReturn("Bearer token");

        ScripMasterDownloadService.ScripMasterFilesResponse.Data data = new ScripMasterDownloadService.ScripMasterFilesResponse.Data(
                "base", List.of("http://files.local/file1.csv"));
        ScripMasterDownloadService.ScripMasterFilesResponse payload = new ScripMasterDownloadService.ScripMasterFilesResponse(data);
        when(restTemplate.exchange(eq("http://localhost:9090/scrip-paths"), eq(HttpMethod.GET), any(),
                eq(ScripMasterDownloadService.ScripMasterFilesResponse.class))).thenReturn(ResponseEntity.ok(payload));

        org.mockito.Mockito.doAnswer(invocation -> {
            ResponseExtractor<?> extractor = invocation.getArgument(3);
            ClientHttpResponse response = org.mockito.Mockito.mock(ClientHttpResponse.class);
            when(response.getBody()).thenReturn(new ByteArrayInputStream("a,b\n1,2\n".getBytes()));
            return extractor.extractData(response);
        }).when(restTemplate).execute(eq("http://files.local/file1.csv"), eq(HttpMethod.GET), eq(null), any());

        ScripMasterDownloadService service = new ScripMasterDownloadService(restTemplate, props, new ObjectMapper());
        service.downloadAll();
        service.downloadAll();

        String dateFolder = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        Path downloaded = downloadRoot.resolve(dateFolder).resolve("file1.csv");
        assertTrue(Files.exists(downloaded));
    }

    @Test
    void downloadAll_whenFileListRequestFails_completesWithoutDownload() throws Exception {
        Path sessionFile = tempDir.resolve("session.json");
        Path downloadRoot = tempDir.resolve("downloads");
        Files.writeString(sessionFile, "{\"token\":\"abc\",\"baseUrl\":\"http://localhost:9090\"}");

        when(props.getSessionFile()).thenReturn(sessionFile.toString());
        when(props.getDownloadRoot()).thenReturn(downloadRoot.toString());
        when(props.getFilePathsEndpoint()).thenReturn("/scrip-paths");
        when(props.getAuthorization()).thenReturn("Bearer token");
        when(restTemplate.exchange(eq("http://localhost:9090/scrip-paths"), eq(HttpMethod.GET), any(),
                eq(ScripMasterDownloadService.ScripMasterFilesResponse.class))).thenThrow(new RuntimeException("boom"));

        ScripMasterDownloadService service = new ScripMasterDownloadService(restTemplate, props, new ObjectMapper());
        service.downloadAll();

        String dateFolder = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        assertTrue(Files.exists(downloadRoot.resolve(dateFolder)));
    }

    @Test
    void downloadAll_whenSessionMissingBaseUrl_throws() throws Exception {
        Path sessionFile = tempDir.resolve("session.json");
        Files.writeString(sessionFile, "{\"token\":\"abc\",\"baseUrl\":\"\"}");

        when(props.getSessionFile()).thenReturn(sessionFile.toString());

        ScripMasterDownloadService service = new ScripMasterDownloadService(restTemplate, props, new ObjectMapper());

        assertThrows(RuntimeException.class, service::downloadAll);
    }

    @Test
    void downloadAll_whenFileBodyIsEmpty_throws() throws Exception {
        Path sessionFile = tempDir.resolve("session.json");
        Path downloadRoot = tempDir.resolve("downloads");
        Files.writeString(sessionFile, "{\"token\":\"abc\",\"baseUrl\":\"http://localhost:9090\"}");

        when(props.getSessionFile()).thenReturn(sessionFile.toString());
        when(props.getDownloadRoot()).thenReturn(downloadRoot.toString());
        when(props.getFilePathsEndpoint()).thenReturn("/scrip-paths");
        when(props.getAuthorization()).thenReturn("Bearer token");

        ScripMasterDownloadService.ScripMasterFilesResponse.Data data = new ScripMasterDownloadService.ScripMasterFilesResponse.Data(
                "base", List.of("http://files.local/file1.csv"));
        ScripMasterDownloadService.ScripMasterFilesResponse payload = new ScripMasterDownloadService.ScripMasterFilesResponse(data);
        when(restTemplate.exchange(eq("http://localhost:9090/scrip-paths"), eq(HttpMethod.GET), any(),
                eq(ScripMasterDownloadService.ScripMasterFilesResponse.class))).thenReturn(ResponseEntity.ok(payload));

        org.mockito.Mockito.doAnswer(invocation -> {
            ResponseExtractor<?> extractor = invocation.getArgument(3);
            ClientHttpResponse response = org.mockito.Mockito.mock(ClientHttpResponse.class);
            when(response.getBody()).thenReturn(null);
            return extractor.extractData(response);
        }).when(restTemplate).execute(eq("http://files.local/file1.csv"), eq(HttpMethod.GET), eq(null), any());

        ScripMasterDownloadService service = new ScripMasterDownloadService(restTemplate, props, new ObjectMapper());

        assertThrows(RuntimeException.class, service::downloadAll);
    }
}
