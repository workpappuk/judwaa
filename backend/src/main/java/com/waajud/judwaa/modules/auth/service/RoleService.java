package com.waajud.judwaa.modules.auth.service;

import com.waajud.judwaa.modules.auth.entity.*;
import com.waajud.judwaa.modules.auth.repository.*;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoleService {
	private final RoleRepository roleRepository;

	@Autowired
	public RoleService(RoleRepository roleRepository) {
		this.roleRepository = roleRepository;
	}

	public Optional<Role> findByName(String name) {
		return roleRepository.findByName(name);
	}
	// Add more role management methods as needed
}
