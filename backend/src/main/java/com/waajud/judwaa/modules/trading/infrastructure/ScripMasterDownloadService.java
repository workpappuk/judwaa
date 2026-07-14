package com.waajud.judwaa.modules.trading.infrastructure;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.waajud.judwaa.config.GlobalExceptionHandler;
import com.waajud.judwaa.modules.trading.domain.KotakProperties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
	private static final Logger logger = LoggerFactory.getLogger(ScripMasterDownloadService.class);

	private final RestTemplate restTemplate;
	private final KotakProperties props;
	private final ObjectMapper objectMapper;

	public ScripMasterDownloadService(RestTemplate restTemplate, KotakProperties props, ObjectMapper objectMapper) {
		this.restTemplate = restTemplate;
		this.props = props;
		this.objectMapper = objectMapper;
	}

	public void downloadAll() {
		SessionInfo session = loadSessionInfo();
		List<String> fileUrls = fetchFileUrls(session.baseUrl());

		Path downloadDir = Path.of(props.getDownloadRoot(), LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE));
		createDir(downloadDir);

		logger.info("Found " + fileUrls.size() + " files");
		logger.info("Downloading into: " + downloadDir);

		for (String fileUrl : fileUrls) {
			String fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
			Path target = downloadDir.resolve(fileName);

			if (Files.exists(target)) {
				logger.info("Skipping existing file: " + fileName);
				continue;
			}

			logger.info("Downloading: " + fileName);
			downloadFile(fileUrl, target);
			logger.info("Saved: " + target);
		}

		logger.info("All downloads completed.");
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
		try {
			ResponseEntity<ScripMasterFilesResponse> response =
					restTemplate.exchange(url, HttpMethod.GET, entity, ScripMasterFilesResponse.class);

			List<String> urls = response.getBody().getData().getFilesPaths();

			return urls;

		} catch (RuntimeException e) {
			e.printStackTrace();
		}

		return List.of();
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


	public  static class ScripMasterFilesResponse {

		private Data data;

		public ScripMasterFilesResponse() {
		}

		public ScripMasterFilesResponse(Data data) {
			this.data = data;
		}

		public Data getData() {
			return data;
		}

		public void setData(Data data) {
			this.data = data;
		}

		public static class Data {
			private String baseFolder;
			private List<String> filesPaths;

			public Data() {
			}

			public Data(String baseFolder, List<String> filesPaths) {
				this.baseFolder = baseFolder;
				this.filesPaths = filesPaths;
			}

			public String getBaseFolder() {
				return baseFolder;
			}

			public void setBaseFolder(String baseFolder) {
				this.baseFolder = baseFolder;
			}

			public List<String> getFilesPaths() {
				return filesPaths;
			}

			public void setFilesPaths(List<String> filesPaths) {
				this.filesPaths = filesPaths;
			}
		}
	}
}