package com.waajud.judwaa.modules.auth.service;

import com.waajud.judwaa.modules.auth.entity.*;
import com.waajud.judwaa.modules.auth.enums.ERole;
import com.waajud.judwaa.modules.auth.repository.*;
import java.util.Optional;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class UserService {
	private final UserRepository userRepository;
	private final RoleRepository roleRepository;

	public UserService(UserRepository userRepository, RoleRepository roleRepository) {
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
	}

	public Optional<User> findByUsername(String username) {
		return userRepository.findByUsername(username);
	}

	public boolean existsByUsername(String username) {
		return userRepository.findByUsername(username).isPresent();
	}

	public User save(User user) {
		Role userRole = roleRepository.findByName(ERole.USER.name()).get();
		user.setRoles(Set.of(userRole));
		return userRepository.save(user);
	}
}
