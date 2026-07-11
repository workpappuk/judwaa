package com.waajud.judwaa.modules.trading.api;

import java.util.LinkedHashMap;
import com.waajud.judwaa.shared.JudwaaResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.waajud.judwaa.modules.trading.application.TradingOrderService;
import com.waajud.judwaa.modules.trading.application.TradingOrderService.TradingOrderRequest;
import com.waajud.judwaa.modules.trading.infrastructure.*;
import com.waajud.judwaa.modules.trading.infrastructure.KotakNeoQuoteService.QuoteResponse;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/neo")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST,
		RequestMethod.OPTIONS}, allowedHeaders = "*", exposedHeaders = {"Content-Type", "Authorization"}, maxAge = 3600)
public class KotakNeoController {

	@Autowired
	private ScripMasterDownloadService scripMasterDownloadService;

	@Autowired
	private KotakSessionService kotakSessionService;

	@Autowired
	private KotakNeoQuoteService kotakNeoQuoteService;

	@Autowired
	private KotakInstrumentService kotakInstrumentService;

	@Autowired
	private TradingOrderService tradingOrderService;

	@PostMapping("/login")
	public JudwaaResponse<Object, String> login(@RequestParam String totp) {
		kotakSessionService.activateTradeSession(totp);
		return JudwaaResponse.build(null, "Login successful with TOTP: " + totp, HttpStatus.OK);
	}

	@GetMapping("/script-download")
	public JudwaaResponse<Object, String> downloadScript() {
		scripMasterDownloadService.downloadAll();

		return JudwaaResponse.build(null, "Script downloaded successfully", HttpStatus.OK);
	}

	@GetMapping("/quotes")
	public JudwaaResponse<List<QuoteResponse>, String> fetchQuotes(@RequestParam List<String> neoSymbols) {
		return JudwaaResponse.build(kotakNeoQuoteService.fetchQuotes(neoSymbols), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@GetMapping("/instruments")
	public JudwaaResponse<KotakInstrumentService.PaginatedInstrumentResponse, String> fetchInstruments(
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "100") int size) {
		return JudwaaResponse.build(kotakInstrumentService.readAllCsvAsPojoPaginated(page, size), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@PostMapping("/orders/replace")
	public JudwaaResponse<Map<String, Object>, String> replaceOrders(@RequestBody List<TradingOrderRequest> orders) {
		int savedCount = tradingOrderService.replaceOrders(orders);
		Map<String, Object> response = new LinkedHashMap<>();
		response.put("savedCount", savedCount);
		return JudwaaResponse.build(response, HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

}
