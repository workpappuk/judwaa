package com.waajud.judwaa.modules.trading.application;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.waajud.judwaa.modules.trading.infrastructure.TradingOrderEntity;
import com.waajud.judwaa.modules.trading.infrastructure.TradingOrderRepository;

@Service
public class TradingOrderService {

	private final TradingOrderRepository tradingOrderRepository;

	public TradingOrderService(TradingOrderRepository tradingOrderRepository) {
		this.tradingOrderRepository = tradingOrderRepository;
	}

	@Transactional
	public int replaceOrders(List<TradingOrderRequest> orders) {
		tradingOrderRepository.deleteAllInBatch();

		if (orders == null || orders.isEmpty()) {
			return 0;
		}

		List<TradingOrderEntity> entities = new ArrayList<>();
		for (TradingOrderRequest order : orders) {
			TradingOrderEntity entity = new TradingOrderEntity();
			entity.setClientOrderId(order.id());
			entity.setNeoSymbol(order.neoSymbol());
			entity.setLabel(order.label());
			entity.setQty(order.qty());
			entity.setAvgPrice(order.avgPrice());
			entity.setSide(order.side());
			entity.setProduct(order.product());
			entity.setExpiry(order.expiry());
			entity.setStrike(order.strike());
			entity.setOptionType(order.optionType());
			entities.add(entity);
		}

		tradingOrderRepository.saveAll(entities);
		return entities.size();
	}

	public record TradingOrderRequest(String id, String neoSymbol, String label, int qty, double avgPrice, String side,
			String product, String expiry, double strike, String optionType) {
	}
}