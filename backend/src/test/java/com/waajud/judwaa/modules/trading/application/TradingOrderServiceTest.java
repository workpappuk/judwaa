package com.waajud.judwaa.modules.trading.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.waajud.judwaa.modules.trading.application.TradingOrderService.TradingOrderRequest;
import com.waajud.judwaa.modules.trading.infrastructure.TradingOrderRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TradingOrderServiceTest {

    @Mock
    private TradingOrderRepository tradingOrderRepository;

    @InjectMocks
    private TradingOrderService service;

    private TradingOrderRequest request;

    @BeforeEach
    void setUp() {
        request = new TradingOrderRequest("id-1", "neo-1", "label", 10, 12.5, "BUY", "NRML", "2026-07-30", 21000,
                "CE");
    }

    @Test
    void replaceOrders_null_returnsZero() {
        int count = service.replaceOrders(null);

        assertEquals(0, count);
        verify(tradingOrderRepository).deleteAllInBatch();
        verify(tradingOrderRepository, never()).saveAll(anyList());
    }

    @Test
    void replaceOrders_empty_returnsZero() {
        int count = service.replaceOrders(List.of());

        assertEquals(0, count);
        verify(tradingOrderRepository).deleteAllInBatch();
        verify(tradingOrderRepository, never()).saveAll(anyList());
    }

    @Test
    void replaceOrders_populated_savesAndReturnsCount() {
        int count = service.replaceOrders(List.of(request, request));

        assertEquals(2, count);
        verify(tradingOrderRepository).deleteAllInBatch();
        verify(tradingOrderRepository).saveAll(anyList());
    }
}
