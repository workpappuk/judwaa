package com.waajud.judwaa.modules.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.Set;
import java.util.UUID;

public class RoleRequestDTO {
	@NotBlank
	private String name;

	private Set<UUID> permissionIds;

	public RoleRequestDTO() {
	}

	public RoleRequestDTO(String name, Set<UUID> permissionIds) {
		this.name = name;
		this.permissionIds = permissionIds;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Set<UUID> getPermissionIds() {
		return permissionIds;
	}

	public void setPermissionIds(Set<UUID> permissionIds) {
		this.permissionIds = permissionIds;
	}
}
