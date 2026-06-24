package com.waajud.judwaa.modules.auth.mapper;

import com.waajud.judwaa.modules.auth.dto.request.*;
import com.waajud.judwaa.modules.auth.dto.response.*;
import com.waajud.judwaa.modules.auth.entity.*;

import java.util.Set;
import java.util.stream.Collectors;

public class UserMapper {
	public static UserResponseDTO toResponseDTO(User user) {
		if (user == null)
			return null;
		UserResponseDTO dto = new UserResponseDTO();
		dto.setId(user.getId());
		dto.setUsername(user.getUsername());
		dto.setRoleIds(
				user.getRoles() != null ? user.getRoles().stream().map(Role::getId).collect(Collectors.toSet()) : null);
		dto.setCreatedAt(user.getCreatedAt());
		dto.setUpdatedAt(user.getUpdatedAt());
		dto.setCreatedBy(user.getCreatedBy());
		dto.setUpdatedBy(user.getUpdatedBy());
		return dto;
	}

	public static User toEntity(UserRequestDTO dto, Set<Role> roles) {
		if (dto == null)
			return null;
		User user = new User();
		user.setUsername(dto.getUsername());
		user.setPassword(dto.getPassword());
		user.setRoles(roles);
		return user;
	}

	public static void updateEntity(User user, UserRequestDTO dto, Set<Role> roles) {
		if (dto.getUsername() != null)
			user.setUsername(dto.getUsername());
		if (dto.getPassword() != null)
			user.setPassword(dto.getPassword());
		if (roles != null)
			user.setRoles(roles);
	}
}
