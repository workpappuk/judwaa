package com.waajud.judwaa.modules.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public class AuthRequestDTO {
	@Schema(description = "Username", example = "admin")
	@NotBlank
	private String username;

	@Schema(description = "Password", example = "admin")
	@NotBlank
	private String password;

	public AuthRequestDTO() {
	}

	public AuthRequestDTO(String username, String password) {
		this.username = username;
		this.password = password;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
}
