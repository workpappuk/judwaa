package com.waajud.judwaa.modules.trading.infrastructure;

import com.waajud.judwaa.modules.auth.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "trading_orders")
public class TradingOrderEntity extends BaseEntity {

	@Column(name = "client_order_id", nullable = false, unique = true, length = 150)
	private String clientOrderId;

	@Column(name = "neo_symbol", nullable = false, length = 120)
	private String neoSymbol;

	@Column(name = "label", nullable = false, length = 220)
	private String label;

	@Column(name = "quantity", nullable = false)
	private int qty;

	@Column(name = "avg_price", nullable = false)
	private double avgPrice;

	@Column(name = "side", nullable = false, length = 20)
	private String side;

	@Column(name = "product", nullable = false, length = 20)
	private String product;

	@Column(name = "expiry", nullable = false, length = 40)
	private String expiry;

	@Column(name = "strike_price", nullable = false)
	private double strike;

	@Column(name = "option_type", nullable = false, length = 10)
	private String optionType;

	public String getClientOrderId() {
		return clientOrderId;
	}

	public void setClientOrderId(String clientOrderId) {
		this.clientOrderId = clientOrderId;
	}

	public String getNeoSymbol() {
		return neoSymbol;
	}

	public void setNeoSymbol(String neoSymbol) {
		this.neoSymbol = neoSymbol;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public int getQty() {
		return qty;
	}

	public void setQty(int qty) {
		this.qty = qty;
	}

	public double getAvgPrice() {
		return avgPrice;
	}

	public void setAvgPrice(double avgPrice) {
		this.avgPrice = avgPrice;
	}

	public String getSide() {
		return side;
	}

	public void setSide(String side) {
		this.side = side;
	}

	public String getProduct() {
		return product;
	}

	public void setProduct(String product) {
		this.product = product;
	}

	public String getExpiry() {
		return expiry;
	}

	public void setExpiry(String expiry) {
		this.expiry = expiry;
	}

	public double getStrike() {
		return strike;
	}

	public void setStrike(double strike) {
		this.strike = strike;
	}

	public String getOptionType() {
		return optionType;
	}

	public void setOptionType(String optionType) {
		this.optionType = optionType;
	}
}