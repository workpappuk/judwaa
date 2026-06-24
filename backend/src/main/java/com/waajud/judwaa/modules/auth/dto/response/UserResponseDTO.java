package com.waajud.judwaa.modules.auth.dto.response;

import com.waajud.judwaa.modules.auth.dto.BaseDTO;
import java.util.Set;
import java.util.UUID;

public class UserResponseDTO extends BaseDTO {
	private String username;
	private Set<UUID> roleIds;

	public UserResponseDTO() {
		super();
	}

	public UserResponseDTO(String username, Set<UUID> roleIds) {
		this.username = username;
		this.roleIds = roleIds;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public Set<UUID> getRoleIds() {
		return roleIds;
	}

	public void setRoleIds(Set<UUID> roleIds) {
		this.roleIds = roleIds;
	}
}
