package com.waajud.judwaa.modules.trading.api;

import java.util.LinkedHashMap;
import org.springframework.beans.factory.annotation.Autowired;
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
	public String login(@RequestParam String totp) {
		kotakSessionService.activateTradeSession(totp);
		return "Login successful with TOTP: " + totp;
	}

	@GetMapping("/script-download")
	public String downloadScript() {
		scripMasterDownloadService.downloadAll();

		return "Script downloaded successfully";
	}

	@GetMapping("/quotes")
	public List<QuoteResponse> fetchQuotes(@RequestParam List<String> neoSymbols) {
		return kotakNeoQuoteService.fetchQuotes(neoSymbols);
	}

	@GetMapping("/instruments")
	public KotakInstrumentService.PaginatedInstrumentResponse fetchInstruments(
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "100") int size) {
		return kotakInstrumentService.readAllCsvAsPojoPaginated(page, size);
	}

	@PostMapping("/orders/replace")
	public Map<String, Object> replaceOrders(@RequestBody List<TradingOrderRequest> orders) {
		int savedCount = tradingOrderService.replaceOrders(orders);
		Map<String, Object> response = new LinkedHashMap<>();
		response.put("savedCount", savedCount);
		return response;
	}

}
