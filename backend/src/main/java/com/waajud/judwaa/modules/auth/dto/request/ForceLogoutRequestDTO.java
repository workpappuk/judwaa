package com.waajud.judwaa.modules.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public class ForceLogoutRequestDTO {
	@Schema(description = "JWT token or Bearer token to revoke", example = "Bearer eyJhbGciOi...")
	@NotBlank
	private String token;

	public ForceLogoutRequestDTO() {
	}

	public ForceLogoutRequestDTO(String token) {
		this.token = token;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}
}