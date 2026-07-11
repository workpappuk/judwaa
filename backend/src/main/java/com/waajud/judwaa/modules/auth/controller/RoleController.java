package com.waajud.judwaa.modules.auth.controller;

import com.waajud.judwaa.modules.auth.dto.request.*;
import com.waajud.judwaa.modules.auth.dto.response.*;
import com.waajud.judwaa.modules.auth.entity.*;
import com.waajud.judwaa.modules.auth.repository.*;
import com.waajud.judwaa.modules.auth.mapper.*;
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

@Tag(name = "Roles", description = "Role management endpoints")
@RestController
@RequestMapping("/api/roles")
public class RoleController {
	@Autowired
	private RoleRepository roleRepository;
	@Autowired
	private PermissionRepository permissionRepository;

	@Operation(summary = "Get all roles", description = "Returns a list of all roles.")
	@GetMapping
	public JudwaaResponse<List<RoleResponseDTO>, String> getAll() {
		List<RoleResponseDTO> roles = roleRepository.findAll().stream().map(RoleMapper::toResponseDTO)
				.collect(Collectors.toList());
		return JudwaaResponse.build(roles, HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@Operation(summary = "Get role by ID", description = "Returns a role by its ID.")
	@GetMapping("/{id}")
	public JudwaaResponse<RoleResponseDTO, String> get(@PathVariable UUID id) {
		return roleRepository.findById(id)
				.map(RoleMapper::toResponseDTO)
				.map(role -> JudwaaResponse.build(role, HttpStatus.OK.getReasonPhrase(), HttpStatus.OK))
				.orElse(JudwaaResponse.build(null, HttpStatus.NOT_FOUND.getReasonPhrase(), HttpStatus.NOT_FOUND));
	}

	@Operation(summary = "Create a new role", description = "Creates a new role.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = RoleRequestDTO.class))))
	@PostMapping
	public JudwaaResponse<RoleResponseDTO, String> create(@RequestBody RoleRequestDTO dto) {
		Role role = RoleMapper.toEntity(dto,
				dto.getPermissionIds() != null
						? permissionRepository.findAllById(dto.getPermissionIds()).stream().collect(Collectors.toSet())
						: null);
		role = roleRepository.save(role);
		return JudwaaResponse.build(RoleMapper.toResponseDTO(role), HttpStatus.CREATED.getReasonPhrase(), HttpStatus.CREATED);
	}

	@Operation(summary = "Update a role", description = "Updates an existing role.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = RoleRequestDTO.class))))
	@PutMapping("/{id}")
	public JudwaaResponse<RoleResponseDTO, String> update(@PathVariable UUID id, @RequestBody RoleRequestDTO dto) {
		return roleRepository.findById(id).map(role -> {
			RoleMapper.updateEntity(role, dto,
					dto.getPermissionIds() != null
							? permissionRepository.findAllById(dto.getPermissionIds()).stream()
									.collect(Collectors.toSet())
							: null);
			role = roleRepository.save(role);
			return JudwaaResponse.build(RoleMapper.toResponseDTO(role), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
		}).orElse(JudwaaResponse.build(null, HttpStatus.NOT_FOUND.getReasonPhrase(), HttpStatus.NOT_FOUND));
	}

	@Operation(summary = "Delete a role", description = "Deletes a role by ID.")
	@DeleteMapping("/{id}")
	public JudwaaResponse<Object, String> delete(@PathVariable UUID id) {
		if (!roleRepository.existsById(id)) {
			return JudwaaResponse.build(null, HttpStatus.NOT_FOUND.getReasonPhrase(), HttpStatus.NOT_FOUND);
		}
		roleRepository.deleteById(id);
		return JudwaaResponse.build(null, "Role deleted", HttpStatus.OK);
	}
}
