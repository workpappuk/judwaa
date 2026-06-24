package com.waajud.judwaa.modules.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.Set;
import java.util.UUID;

public class UserRequestDTO {
	@NotBlank
	private String username;

	@NotBlank
	private String password;

	private Set<UUID> roleIds;

	public UserRequestDTO() {
	}

	public UserRequestDTO(String username, String password, Set<UUID> roleIds) {
		this.username = username;
		this.password = password;
		this.roleIds = roleIds;
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

	public Set<UUID> getRoleIds() {
		return roleIds;
	}

	public void setRoleIds(Set<UUID> roleIds) {
		this.roleIds = roleIds;
	}
}
