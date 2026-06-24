package com.waajud.judwaa.modules.auth.controller;

import com.waajud.judwaa.modules.auth.dto.request.*;
import com.waajud.judwaa.modules.auth.dto.response.*;
import com.waajud.judwaa.modules.auth.entity.*;
import com.waajud.judwaa.modules.auth.jwt.JwtUtil;
import com.waajud.judwaa.modules.auth.repository.*;
import com.waajud.judwaa.modules.auth.service.*;
import com.waajud.judwaa.modules.auth.mapper.*;

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
	public List<RoleResponseDTO> getAll() {
		return roleRepository.findAll().stream().map(RoleMapper::toResponseDTO).collect(Collectors.toList());
	}

	@Operation(summary = "Get role by ID", description = "Returns a role by its ID.")
	@GetMapping("/{id}")
	public ResponseEntity<RoleResponseDTO> get(@PathVariable UUID id) {
		return roleRepository.findById(id).map(RoleMapper::toResponseDTO).map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@Operation(summary = "Create a new role", description = "Creates a new role.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = RoleRequestDTO.class))))
	@PostMapping
	public RoleResponseDTO create(@RequestBody RoleRequestDTO dto) {
		Role role = RoleMapper.toEntity(dto,
				dto.getPermissionIds() != null
						? permissionRepository.findAllById(dto.getPermissionIds()).stream().collect(Collectors.toSet())
						: null);
		role = roleRepository.save(role);
		return RoleMapper.toResponseDTO(role);
	}

	@Operation(summary = "Update a role", description = "Updates an existing role.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = RoleRequestDTO.class))))
	@PutMapping("/{id}")
	public ResponseEntity<RoleResponseDTO> update(@PathVariable UUID id, @RequestBody RoleRequestDTO dto) {
		return roleRepository.findById(id).map(role -> {
			RoleMapper.updateEntity(role, dto,
					dto.getPermissionIds() != null
							? permissionRepository.findAllById(dto.getPermissionIds()).stream()
									.collect(Collectors.toSet())
							: null);
			role = roleRepository.save(role);
			return ResponseEntity.ok(RoleMapper.toResponseDTO(role));
		}).orElse(ResponseEntity.notFound().build());
	}

	@Operation(summary = "Delete a role", description = "Deletes a role by ID.")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id) {
		if (!roleRepository.existsById(id))
			return ResponseEntity.notFound().build();
		roleRepository.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
