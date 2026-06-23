package com.waajud.judwaa.modules.trading.infrastructure;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.waajud.judwaa.modules.trading.domain.KotakProperties;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ScripMasterDownloadService {

    private final RestTemplate restTemplate;
    private final KotakProperties props;
    private final ObjectMapper objectMapper;

    public ScripMasterDownloadService(
            RestTemplate restTemplate,
            KotakProperties props,
            ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.props = props;
        this.objectMapper = objectMapper;
    }

    public void downloadAll() {
        SessionInfo session = loadSessionInfo();
        List<String> fileUrls = fetchFileUrls(session.baseUrl());

        Path downloadDir = Path.of(props.getDownloadRoot(),
                LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE));
        createDir(downloadDir);

        System.out.println("Found " + fileUrls.size() + " files");
        System.out.println("Downloading into: " + downloadDir);

        for (String fileUrl : fileUrls) {
            String fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
            Path target = downloadDir.resolve(fileName);

            if (Files.exists(target)) {
                System.out.println("Skipping existing file: " + fileName);
                continue;
            }

            System.out.println("Downloading: " + fileName);
            downloadFile(fileUrl, target);
            System.out.println("Saved: " + target);
        }

        System.out.println("\nAll downloads completed.");
    }

    private SessionInfo loadSessionInfo() {
        try {
            String json = Files.readString(Path.of(props.getSessionFile()));
            JsonNode root = objectMapper.readTree(json);

            String token = root.path("token").asText("");
            String baseUrl = root.path("baseUrl").asText("");

            if (baseUrl.isBlank()) {
                throw new IllegalStateException("baseUrl missing in session file");
            }
            return new SessionInfo(token, baseUrl);
        } catch (Exception e) {
            throw new RuntimeException("Failed to read session file: " + e.getMessage(), e);
        }
    }

    private List<String> fetchFileUrls(String baseUrl) {
        String url = baseUrl + props.getFilePathsEndpoint();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", props.getAuthorization());
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.GET, entity, JsonNode.class);

        System.out.println("Status: " + response.getStatusCode().value());

        JsonNode body = response.getBody();
        if (body == null) {
            throw new IllegalStateException("Empty response body");
        }

        JsonNode filesNode = body.path("data").path("filesPaths");
        if (!filesNode.isArray()) {
            throw new IllegalStateException("Invalid response shape: data.filesPaths not found");
        }

        List<String> urls = new ArrayList<>();
        for (JsonNode node : filesNode) {
            urls.add(node.asText());
        }
        return urls;
    }

    private void createDir(Path dir) {
        try {
            Files.createDirectories(dir);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create directory: " + dir, e);
        }
    }

    private void downloadFile(String fileUrl, Path target) {
        restTemplate.execute(fileUrl, HttpMethod.GET, null, response -> {
            try (InputStream in = response.getBody()) {
                if (in == null) {
                    throw new IllegalStateException("Empty file response body for " + fileUrl);
                }
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
                return null;
            }
        });
    }

    private record SessionInfo(String token, String baseUrl) {
    }
}