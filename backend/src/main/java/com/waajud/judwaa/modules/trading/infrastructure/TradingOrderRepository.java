package com.waajud.judwaa.modules.trading.infrastructure;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TradingOrderRepository extends JpaRepository<TradingOrderEntity, UUID> {
}