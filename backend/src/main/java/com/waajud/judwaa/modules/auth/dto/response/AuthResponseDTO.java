package com.waajud.judwaa.modules.auth.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

public class AuthResponseDTO {
	@Schema(description = "JWT token")
	private String token;

	public AuthResponseDTO() {
	}

	public AuthResponseDTO(String token) {
		this.token = token;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}
}
