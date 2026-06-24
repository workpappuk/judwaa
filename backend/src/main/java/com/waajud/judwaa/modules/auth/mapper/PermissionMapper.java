package com.waajud.judwaa.modules.auth.mapper;

import com.waajud.judwaa.modules.auth.dto.request.*;
import com.waajud.judwaa.modules.auth.dto.response.*;
import com.waajud.judwaa.modules.auth.entity.*;

public class PermissionMapper {
	public static PermissionResponseDTO toResponseDTO(Permission permission) {
		if (permission == null)
			return null;
		PermissionResponseDTO dto = new PermissionResponseDTO();
		dto.setId(permission.getId());
		dto.setName(permission.getName());
		dto.setCreatedAt(permission.getCreatedAt());
		dto.setUpdatedAt(permission.getUpdatedAt());
		dto.setCreatedBy(permission.getCreatedBy());
		dto.setUpdatedBy(permission.getUpdatedBy());
		return dto;
	}

	public static Permission toEntity(PermissionRequestDTO dto) {
		if (dto == null)
			return null;
		Permission permission = new Permission();
		permission.setName(dto.getName());
		return permission;
	}

	public static void updateEntity(Permission permission, PermissionRequestDTO dto) {
		if (dto.getName() != null)
			permission.setName(dto.getName());
	}
}
