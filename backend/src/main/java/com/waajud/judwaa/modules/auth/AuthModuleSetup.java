package com.waajud.judwaa.modules.auth;

import com.waajud.judwaa.modules.auth.entity.*;
import com.waajud.judwaa.modules.auth.enums.*;
import com.waajud.judwaa.modules.auth.repository.*;
import com.waajud.judwaa.modules.auth.service.*;

import java.util.*;
import java.util.HashSet;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AuthModuleSetup {
	private static final Logger logger = LoggerFactory.getLogger(AuthModuleSetup.class);

	@Bean
	public CommandLineRunner seedAuth(UserService userService, UserRepository userRepository, RoleRepository roleRepository,
			PermissionRepository permissionRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			logger.info("AuthModuleSetup start!");

			userRepository.deleteAll();
			roleRepository.deleteAll();
			permissionRepository.deleteAll();


			Map<ERole, Set<EPermission>> rolePermissions = new HashMap<>();
			Set<EPermission> set1 = new HashSet<>();
			set1.add(EPermission.READ); 
			set1.add(EPermission.WRITE);
			set1.add( EPermission.DELETE);
			set1.add( EPermission.UPDATE);
			rolePermissions.put(ERole.ADMIN, set1);

			Set<EPermission> set2 = new HashSet<>();
			set2.add(EPermission.READ); 
			rolePermissions.put(ERole.USER, set2);


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
				Set<Role> roles = new HashSet<>();
				roles.add(adminRole);
				admin.setRoles(roles);
				userService.save(admin);
				logger.info("#### Admin user created: username=admin, password=admin");
			} else {
				logger.info("#### Admin user already exists: username=admin, password=admin");
			}

			logger.info(
					"Seed Summary -> Permissions: {}, Roles: {}, Users: {}",
					permissionRepository.count(),
					roleRepository.count(),
					userRepository.count()
			);
		};


	}
}
