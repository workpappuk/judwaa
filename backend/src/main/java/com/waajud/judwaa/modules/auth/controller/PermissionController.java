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

@Tag(name = "Permissions", description = "Permission management endpoints")
@RestController
@RequestMapping("/api/permissions")
public class PermissionController {
	@Autowired
	private PermissionRepository permissionRepository;

	@Operation(summary = "Get all permissions", description = "Returns a list of all permissions.")
	@GetMapping
	public List<PermissionResponseDTO> getAll() {
		return permissionRepository.findAll().stream().map(PermissionMapper::toResponseDTO)
				.collect(Collectors.toList());
	}

	@Operation(summary = "Get permission by ID", description = "Returns a permission by its ID.")
	@GetMapping("/{id}")
	public ResponseEntity<PermissionResponseDTO> get(@PathVariable UUID id) {
		return permissionRepository.findById(id).map(PermissionMapper::toResponseDTO).map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@Operation(summary = "Create a new permission", description = "Creates a new permission.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = PermissionRequestDTO.class))))
	@PostMapping
	public PermissionResponseDTO create(@RequestBody PermissionRequestDTO dto) {
		Permission permission = PermissionMapper.toEntity(dto);
		permission = permissionRepository.save(permission);
		return PermissionMapper.toResponseDTO(permission);
	}

	@Operation(summary = "Update a permission", description = "Updates an existing permission.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = PermissionRequestDTO.class))))
	@PutMapping("/{id}")
	public ResponseEntity<PermissionResponseDTO> update(@PathVariable UUID id, @RequestBody PermissionRequestDTO dto) {
		return permissionRepository.findById(id).map(permission -> {
			PermissionMapper.updateEntity(permission, dto);
			permission = permissionRepository.save(permission);
			return ResponseEntity.ok(PermissionMapper.toResponseDTO(permission));
		}).orElse(ResponseEntity.notFound().build());
	}

	@Operation(summary = "Delete a permission", description = "Deletes a permission by ID.")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id) {
		if (!permissionRepository.existsById(id))
			return ResponseEntity.notFound().build();
		permissionRepository.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
