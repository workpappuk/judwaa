package com.waajud.judwaa.modules.lms.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ContactInfo {
	@Column(name = "contact_email", length = 255)
	private String email;

	@Column(name = "contact_phone", length = 40)
	private String phone;

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}
}
