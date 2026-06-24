package com.waajud.judwaa.modules.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public class RegisterRequestDTO {
	@Schema(description = "Username", example = "newuser")
	@NotBlank
	private String username;

	@Schema(description = "Password", example = "password")
	@NotBlank
	private String password;

	public RegisterRequestDTO() {
	}

	public RegisterRequestDTO(String username, String password) {
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
