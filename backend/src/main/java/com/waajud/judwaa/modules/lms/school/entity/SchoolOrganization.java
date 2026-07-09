package com.waajud.judwaa.modules.lms.school.entity;

import com.waajud.judwaa.modules.lms.common.entity.LmsBaseEntity;
import com.waajud.judwaa.modules.lms.common.entity.AddressInfo;
import com.waajud.judwaa.modules.lms.common.entity.ContactInfo;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Entity
@Table(name = "school_organizations", indexes = {@Index(name = "idx_school_organizations_code", columnList = "code", unique = true)})
public class SchoolOrganization extends LmsBaseEntity {
	@Column(nullable = false, length = 40, unique = true)
	private String code;

	@Column(nullable = false, length = 200)
	private String name;

	@Embedded
	private ContactInfo contact = new ContactInfo();

	@Embedded
	private AddressInfo address = new AddressInfo();

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
}
