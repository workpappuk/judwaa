package com.waajud.judwaa.modules.auth.dto.response;

import com.waajud.judwaa.modules.auth.dto.BaseDTO;

public class PermissionResponseDTO extends BaseDTO {
	private String name;

	public PermissionResponseDTO() {
		super();
	}

	public PermissionResponseDTO(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
}
