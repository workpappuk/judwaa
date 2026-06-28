package com.waajud.judwaa.modules.trading.infrastructure;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.waajud.judwaa.modules.trading.domain.KotakProperties;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@Service
public class KotakSessionService {

	private final RestTemplate restTemplate;
	private final KotakProperties props;
	private final ObjectMapper objectMapper;

	public KotakSessionService(RestTemplate restTemplate, KotakProperties props, ObjectMapper objectMapper) {
		this.restTemplate = restTemplate;
		this.props = props;
		this.objectMapper = objectMapper;
	}

	private final String NEO_FIN_KEY = "neotradeapi";

	public Map<String, Object> activateTradeSession(String totp) {
		Map<String, Object> loginData = login(totp);
		String viewToken = String.valueOf(loginData.get("token"));
		String viewSid = String.valueOf(loginData.get("sid"));

		Map<String, Object> tradeData = validateTradeSession(viewToken, viewSid);
		saveSession(tradeData);
		return tradeData;
	}

	private Map<String, Object> login(String totp) {
		Map<String, Object> payload = new HashMap<>();
		payload.put("mobileNumber", props.getMobileNumber());
		payload.put("ucc", props.getUcc());
		payload.put("totp", totp);

		Map<String, String> headers = Map.of("Authorization", props.getAuthorization(), "neo-fin-key", NEO_FIN_KEY);

		return postForData(props.getLoginUrl() + "/tradeApiLogin", headers, payload);
	}

	private Map<String, Object> validateTradeSession(String viewToken, String viewSid) {
		Map<String, Object> payload = Map.of("mpin", props.getMpin());

		Map<String, String> headers = Map.of("Authorization", props.getAuthorization(), "neo-fin-key", NEO_FIN_KEY,
				"sid", viewSid, "Auth", viewToken);

		return postForData(props.getLoginUrl() + "/tradeApiValidate", headers, payload);
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> postForData(String url, Map<String, String> headersMap, Object body) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			headersMap.forEach(headers::set);

			HttpEntity<Object> entity = new HttpEntity<>(body, headers);

			ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
			Map<String, Object> responseBody = response.getBody();

			if (responseBody == null || !responseBody.containsKey("data")) {
				throw new RuntimeException("API call failed: " + responseBody);
			}

			Object data = responseBody.get("data");
			return objectMapper.convertValue(data, new TypeReference<Map<String, Object>>() {
			});
		} catch (HttpStatusCodeException e) {
			throw new RuntimeException("HTTP " + e.getStatusCode().value() + ": " + e.getResponseBodyAsString(), e);
		}
	}

	private void saveSession(Map<String, Object> tradeData) {
		try {
			Path sessionPath = Path.of(props.getSessionFile());
			Files.deleteIfExists(sessionPath);
			Files.createDirectories(sessionPath.getParent());
			String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(tradeData);
			Files.writeString(sessionPath, json, StandardCharsets.UTF_8);
		} catch (Exception e) {
			throw new RuntimeException("Failed to write session JSON: " + e.getMessage(), e);
		}
	}
}