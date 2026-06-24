package com.waajud.judwaa.modules.auth.mapper;

import com.waajud.judwaa.modules.auth.dto.request.*;
import com.waajud.judwaa.modules.auth.dto.response.*;
import com.waajud.judwaa.modules.auth.entity.*;

import java.util.Set;
import java.util.stream.Collectors;

public class RoleMapper {
	public static RoleResponseDTO toResponseDTO(Role role) {
		if (role == null)
			return null;
		RoleResponseDTO dto = new RoleResponseDTO();
		dto.setId(role.getId());
		dto.setName(role.getName());
		dto.setPermissionIds(role.getPermissions() != null
				? role.getPermissions().stream().map(Permission::getId).collect(Collectors.toSet())
				: null);
		dto.setCreatedAt(role.getCreatedAt());
		dto.setUpdatedAt(role.getUpdatedAt());
		dto.setCreatedBy(role.getCreatedBy());
		dto.setUpdatedBy(role.getUpdatedBy());
		return dto;
	}

	public static Role toEntity(RoleRequestDTO dto, Set<Permission> permissions) {
		if (dto == null)
			return null;
		Role role = new Role();
		role.setName(dto.getName());
		role.setPermissions(permissions);
		return role;
	}

	public static void updateEntity(Role role, RoleRequestDTO dto, Set<Permission> permissions) {
		if (dto.getName() != null)
			role.setName(dto.getName());
		if (permissions != null)
			role.setPermissions(permissions);
	}
}
