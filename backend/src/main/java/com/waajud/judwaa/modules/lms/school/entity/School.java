package com.waajud.judwaa.modules.lms.school.entity;

import com.waajud.judwaa.modules.lms.common.entity.AddressInfo;
import com.waajud.judwaa.modules.lms.common.entity.ContactInfo;
import com.waajud.judwaa.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
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
	private SchoolOrganization organization;

	@Column(nullable = false, length = 40)
	private String code;

	@Column(nullable = false, length = 200)
	private String name;

	@Column(length = 80)
	private String board;

	@Embedded
	private AddressInfo address = new AddressInfo();

	@Embedded
	private ContactInfo contact = new ContactInfo();

	public SchoolOrganization getOrganization() {
		return organization;
	}

	public void setOrganization(SchoolOrganization organization) {
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
		return address.getLine1();
	}

	public void setAddressLine1(String addressLine1) {
		address.setLine1(addressLine1);
	}

	public String getAddressLine2() {
		return address.getLine2();
	}

	public void setAddressLine2(String addressLine2) {
		address.setLine2(addressLine2);
	}

	public String getCity() {
		return address.getCity();
	}

	public void setCity(String city) {
		address.setCity(city);
	}

	public String getState() {
		return address.getState();
	}

	public void setState(String state) {
		address.setState(state);
	}

	public String getCountry() {
		return address.getCountry();
	}

	public void setCountry(String country) {
		address.setCountry(country);
	}

	public String getPincode() {
		return address.getPincode();
	}

	public void setPincode(String pincode) {
		address.setPincode(pincode);
	}

	public String getContactEmail() {
		return contact.getEmail();
	}

	public void setContactEmail(String contactEmail) {
		contact.setEmail(contactEmail);
	}

	public String getContactPhone() {
		return contact.getPhone();
	}

	public void setContactPhone(String contactPhone) {
		contact.setPhone(contactPhone);
	}

}
