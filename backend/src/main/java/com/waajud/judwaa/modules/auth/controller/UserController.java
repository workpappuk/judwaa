package com.waajud.judwaa.modules.auth.controller;

import com.waajud.judwaa.modules.auth.dto.request.*;
import com.waajud.judwaa.modules.auth.dto.response.*;
import com.waajud.judwaa.modules.auth.entity.*;
import com.waajud.judwaa.modules.auth.jwt.JwtUtil;
import com.waajud.judwaa.modules.auth.mapper.*;
import com.waajud.judwaa.modules.auth.repository.*;
import com.waajud.judwaa.modules.auth.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Users", description = "User management endpoints")
@RestController
@RequestMapping("/api/users")
public class UserController {
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private RoleRepository roleRepository;

	@Operation(summary = "Get all users", description = "Returns a list of all users.")
	@GetMapping
	public List<UserResponseDTO> getAll() {
		return userRepository.findAll().stream().map(UserMapper::toResponseDTO).collect(Collectors.toList());
	}

	@Operation(summary = "Get user by ID", description = "Returns a user by their ID.")
	@GetMapping("/{id}")
	public ResponseEntity<UserResponseDTO> get(@PathVariable UUID id) {
		return userRepository.findById(id).map(UserMapper::toResponseDTO).map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@Operation(summary = "Create a new user", description = "Creates a new user.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = UserRequestDTO.class))))
	@PostMapping
	public UserResponseDTO create(@RequestBody UserRequestDTO dto) {
		User user = UserMapper.toEntity(dto,
				dto.getRoleIds() != null
						? roleRepository.findAllById(dto.getRoleIds()).stream().collect(Collectors.toSet())
						: null);
		user = userRepository.save(user);
		return UserMapper.toResponseDTO(user);
	}

	@Operation(summary = "Update a user", description = "Updates an existing user.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = UserRequestDTO.class))))
	@PutMapping("/{id}")
	public ResponseEntity<UserResponseDTO> update(@PathVariable UUID id, @RequestBody UserRequestDTO dto) {
		return userRepository.findById(id).map(user -> {
			UserMapper.updateEntity(user, dto,
					dto.getRoleIds() != null
							? roleRepository.findAllById(dto.getRoleIds()).stream().collect(Collectors.toSet())
							: null);
			user = userRepository.save(user);
			return ResponseEntity.ok(UserMapper.toResponseDTO(user));
		}).orElse(ResponseEntity.notFound().build());
	}

	@Operation(summary = "Delete a user", description = "Deletes a user by ID.")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id) {
		if (!userRepository.existsById(id))
			return ResponseEntity.notFound().build();
		userRepository.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
