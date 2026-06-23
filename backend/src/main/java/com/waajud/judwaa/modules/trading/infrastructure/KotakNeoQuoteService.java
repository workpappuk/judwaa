package com.waajud.judwaa.modules.trading.infrastructure;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.waajud.judwaa.modules.trading.domain.KotakProperties;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;
import java.nio.file.*;

@Service
public class KotakNeoQuoteService {

    private final RestTemplate restTemplate;
    private final KotakProperties props;
    private final ObjectMapper objectMapper;

    public KotakNeoQuoteService(
            RestTemplate restTemplate,
            KotakProperties props,
            ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.props = props;
        this.objectMapper = objectMapper;
    }

    private record SessionInfo(String token, String baseUrl) {
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

    public List<QuoteResponse> fetchQuotes(List<String> neoSymbols) {
        SessionInfo session = loadSessionInfo();

        // Encode each symbol safely for path usage: nse_cm|Nifty 50 ->
        // nse_cm%7CNifty%2050
        String encodedSymbols = neoSymbols.stream()
                .map(this::encodePathPart)
                .collect(Collectors.joining(","));

        String url = session.baseUrl() + "/script-details/1.0/quotes/neosymbol/" + encodedSymbols + "/all";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", props.getAuthorization());

        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<QuoteResponse[]> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                request,
                QuoteResponse[].class);

        QuoteResponse[] body = response.getBody();
        return body == null ? List.of() : List.of(body);
    }

    private String encodePathPart(String value) {
        // URLEncoder makes spaces '+', convert to %20 for URL path compatibility
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class QuoteResponse {
        public String exchange_token;
        public String display_symbol;
        public String exchange;
        public String lstup_time;
        public String ltp;
        public String last_traded_quantity;
        public String total_buy;
        public String total_sell;
        public String last_volume;
        public String change;
        public String per_change;
        public String year_high;
        public String year_low;
        public Ohlc ohlc;
        public Depth depth;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Ohlc {
        public String open;
        public String high;
        public String low;
        public String close;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Depth {
        public List<DepthLevel> buy;
        public List<DepthLevel> sell;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DepthLevel {
        public String price;
        public String quantity;
        public String orders;
    }
}