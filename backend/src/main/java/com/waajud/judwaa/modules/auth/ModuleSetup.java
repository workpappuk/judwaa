package com.waajud.judwaa.modules.auth;

import com.waajud.judwaa.modules.auth.entity.*;
import com.waajud.judwaa.modules.auth.enums.*;
import com.waajud.judwaa.modules.auth.mapper.*;
import com.waajud.judwaa.modules.auth.repository.*;
import com.waajud.judwaa.modules.auth.service.*;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class ModuleSetup {

	@Bean
	public CommandLineRunner createAdminUser(UserService userService, RoleRepository roleRepository,
			PermissionRepository permissionRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			Map<ERole, Set<EPermission>> rolePermissions = Map.of(ERole.ADMIN,
					Set.of(EPermission.READ, EPermission.WRITE, EPermission.DELETE, EPermission.UPDATE), ERole.USER,
					Set.of(EPermission.READ));

			/*
			 * 1. Create permissions if they don't exist 2. Create roles and assign
			 * permissions 3. Create admin user with ADMIN role
			 */

			EPermission[] permissions = EPermission.values();
			for (EPermission permission : permissions) {
				if (!permissionRepository.existsByName(permission.name())) {
					permissionRepository.save(new Permission(permission.name()));
				}
			}

			for (Map.Entry<ERole, Set<EPermission>> entry : rolePermissions.entrySet()) {
				ERole roleName = entry.getKey();
				Set<EPermission> perms = entry.getValue();

				if (!roleRepository.existsByName(roleName.name())) {
					Role role = new Role();
					role.setName(roleName.name());
					Set<Permission> permissionEntities = perms.stream()
							.map(p -> permissionRepository.findByName(p.name()).get()).collect(Collectors.toSet());
					role.setPermissions(permissionEntities);
					roleRepository.save(role);
				}
			}

			String adminUsername = "admin";
			String adminPassword = "admin";
			if (!userService.existsByUsername(adminUsername)) {
				User admin = new User();
				admin.setUsername(adminUsername);
				admin.setPassword(passwordEncoder.encode(adminPassword));
				Role adminRole = roleRepository.findByName(ERole.ADMIN.name()).get();
				admin.setRoles(Set.of(adminRole));
				userService.save(admin);
				System.out.println("Admin user created: username=admin, password=admin");
			} else {
				System.out.println("Admin user already exists");
			}
		};
	}
}
