package com.waajud.judwaa.modules.auth.service;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.waajud.judwaa.modules.auth.entity.Permission;
import com.waajud.judwaa.modules.auth.repository.PermissionRepository;

@Service
public class PermissionService {
	private final PermissionRepository permissionRepository;

	@Autowired
	public PermissionService(PermissionRepository permissionRepository) {
		this.permissionRepository = permissionRepository;
	}

	public Optional<Permission> findByName(String name) {
		return permissionRepository.findByName(name);
	}
}
