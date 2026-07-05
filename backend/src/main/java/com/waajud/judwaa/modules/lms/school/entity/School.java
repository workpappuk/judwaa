package com.waajud.judwaa.modules.lms.school.entity;

import com.waajud.judwaa.modules.auth.entity.BaseEntity;
import com.waajud.judwaa.modules.lms.common.enums.RecordStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "schools", indexes = {@Index(name = "idx_schools_org", columnList = "organization_id"),
		@Index(name = "idx_schools_org_code", columnList = "organization_id,code", unique = true)})
public class School extends BaseEntity {
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "organization_id", nullable = false, foreignKey = @ForeignKey(name = "fk_schools_org"))
	private Organization organization;

	@Column(nullable = false, length = 40)
	private String code;

	@Column(nullable = false, length = 200)
	private String name;

	@Column(length = 80)
	private String board;

	@Column(name = "address_line1", length = 255)
	private String addressLine1;

	@Column(length = 100)
	private String city;

	@Column(length = 100)
	private String state;

	@Column(length = 100)
	private String country;

	@Column(length = 20)
	private String pincode;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private RecordStatus status = RecordStatus.ACTIVE;

	public Organization getOrganization() {
		return organization;
	}

	public void setOrganization(Organization organization) {
		this.organization = organization;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getBoard() {
		return board;
	}

	public void setBoard(String board) {
		this.board = board;
	}

	public String getAddressLine1() {
		return addressLine1;
	}

	public void setAddressLine1(String addressLine1) {
		this.addressLine1 = addressLine1;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public String getPincode() {
		return pincode;
	}

	public void setPincode(String pincode) {
		this.pincode = pincode;
	}

	public RecordStatus getStatus() {
		return status;
	}

	public void setStatus(RecordStatus status) {
		this.status = status;
	}
}
