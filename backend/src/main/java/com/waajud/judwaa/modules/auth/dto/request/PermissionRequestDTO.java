package com.waajud.judwaa.modules.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

public class PermissionRequestDTO {
	@NotBlank
	private String name;

	public PermissionRequestDTO() {
	}

	public PermissionRequestDTO(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
}
