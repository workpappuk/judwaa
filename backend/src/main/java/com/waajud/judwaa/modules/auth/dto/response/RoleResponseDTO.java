package com.waajud.judwaa.modules.auth.dto.response;

import com.waajud.judwaa.modules.auth.dto.BaseDTO;
import java.util.Set;
import java.util.UUID;

public class RoleResponseDTO extends BaseDTO {
	private String name;
	private Set<UUID> permissionIds;

	public RoleResponseDTO() {
		super();
	}

	public RoleResponseDTO(String name, Set<UUID> permissionIds) {
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
