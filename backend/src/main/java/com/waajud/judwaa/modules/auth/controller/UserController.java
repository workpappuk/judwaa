package com.waajud.judwaa.modules.auth.controller;

import com.waajud.judwaa.modules.auth.dto.request.*;
import com.waajud.judwaa.modules.auth.dto.response.*;
import com.waajud.judwaa.modules.auth.entity.*;
import com.waajud.judwaa.modules.auth.mapper.*;
import com.waajud.judwaa.modules.auth.repository.*;
import com.waajud.judwaa.shared.JudwaaResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
	public JudwaaResponse<List<UserResponseDTO>, String> getAll() {
		List<UserResponseDTO> users = userRepository.findAll().stream().map(UserMapper::toResponseDTO)
				.collect(Collectors.toList());
		return JudwaaResponse.build(users, HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@Operation(summary = "Get user by ID", description = "Returns a user by their ID.")
	@GetMapping("/{id}")
	public JudwaaResponse<UserResponseDTO, String> get(@PathVariable UUID id) {
		return userRepository.findById(id)
				.map(UserMapper::toResponseDTO)
				.map(user -> JudwaaResponse.build(user, HttpStatus.OK.getReasonPhrase(), HttpStatus.OK))
				.orElse(JudwaaResponse.build(null, HttpStatus.NOT_FOUND.getReasonPhrase(), HttpStatus.NOT_FOUND));
	}

	@Operation(summary = "Create a new user", description = "Creates a new user.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = UserRequestDTO.class))))
	@PostMapping
	public JudwaaResponse<UserResponseDTO, String> create(@RequestBody UserRequestDTO dto) {
		User user = UserMapper.toEntity(dto,
				dto.getRoleIds() != null
						? roleRepository.findAllById(dto.getRoleIds()).stream().collect(Collectors.toSet())
						: null);
		user = userRepository.save(user);
		return JudwaaResponse.build(UserMapper.toResponseDTO(user), HttpStatus.CREATED.getReasonPhrase(), HttpStatus.CREATED);
	}

	@Operation(summary = "Update a user", description = "Updates an existing user.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = UserRequestDTO.class))))
	@PutMapping("/{id}")
	public JudwaaResponse<UserResponseDTO, String> update(@PathVariable UUID id, @RequestBody UserRequestDTO dto) {
		return userRepository.findById(id).map(user -> {
			UserMapper.updateEntity(user, dto,
					dto.getRoleIds() != null
							? roleRepository.findAllById(dto.getRoleIds()).stream().collect(Collectors.toSet())
							: null);
			user = userRepository.save(user);
			return JudwaaResponse.build(UserMapper.toResponseDTO(user), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
		}).orElse(JudwaaResponse.build(null, HttpStatus.NOT_FOUND.getReasonPhrase(), HttpStatus.NOT_FOUND));
	}

	@Operation(summary = "Delete a user", description = "Deletes a user by ID.")
	@DeleteMapping("/{id}")
	public JudwaaResponse<Object, String> delete(@PathVariable UUID id) {
		if (!userRepository.existsById(id)) {
			return JudwaaResponse.build(null, HttpStatus.NOT_FOUND.getReasonPhrase(), HttpStatus.NOT_FOUND);
		}
		userRepository.deleteById(id);
		return JudwaaResponse.build(null, "User deleted", HttpStatus.OK);
	}
}
