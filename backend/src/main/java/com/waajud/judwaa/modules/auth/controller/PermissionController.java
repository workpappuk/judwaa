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

@Tag(name = "Permissions", description = "Permission management endpoints")
@RestController
@RequestMapping("/api/permissions")
public class PermissionController {
	@Autowired
	private PermissionRepository permissionRepository;

	@Operation(summary = "Get all permissions", description = "Returns a list of all permissions.")
	@GetMapping
	public JudwaaResponse<List<PermissionResponseDTO>, String> getAll() {
		List<PermissionResponseDTO> permissions = permissionRepository.findAll().stream().map(PermissionMapper::toResponseDTO)
				.collect(Collectors.toList());
		return JudwaaResponse.build(permissions, HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@Operation(summary = "Get permission by ID", description = "Returns a permission by its ID.")
	@GetMapping("/{id}")
	public JudwaaResponse<PermissionResponseDTO, String> get(@PathVariable UUID id) {
		return permissionRepository.findById(id)
				.map(PermissionMapper::toResponseDTO)
				.map(permission -> JudwaaResponse.build(permission, HttpStatus.OK.getReasonPhrase(), HttpStatus.OK))
				.orElse(JudwaaResponse.build(null, HttpStatus.NOT_FOUND.getReasonPhrase(), HttpStatus.NOT_FOUND));
	}

	@Operation(summary = "Create a new permission", description = "Creates a new permission.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = PermissionRequestDTO.class))))
	@PostMapping
	public JudwaaResponse<PermissionResponseDTO, String> create(@RequestBody PermissionRequestDTO dto) {
		Permission permission = PermissionMapper.toEntity(dto);
		permission = permissionRepository.save(permission);
		return JudwaaResponse.build(PermissionMapper.toResponseDTO(permission), HttpStatus.CREATED.getReasonPhrase(), HttpStatus.CREATED);
	}

	@Operation(summary = "Update a permission", description = "Updates an existing permission.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = PermissionRequestDTO.class))))
	@PutMapping("/{id}")
	public JudwaaResponse<PermissionResponseDTO, String> update(@PathVariable UUID id, @RequestBody PermissionRequestDTO dto) {
		return permissionRepository.findById(id).map(permission -> {
			PermissionMapper.updateEntity(permission, dto);
			permission = permissionRepository.save(permission);
			return JudwaaResponse.build(PermissionMapper.toResponseDTO(permission), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
		}).orElse(JudwaaResponse.build(null, HttpStatus.NOT_FOUND.getReasonPhrase(), HttpStatus.NOT_FOUND));
	}

	@Operation(summary = "Delete a permission", description = "Deletes a permission by ID.")
	@DeleteMapping("/{id}")
	public JudwaaResponse<Object, String> delete(@PathVariable UUID id) {
		if (!permissionRepository.existsById(id)) {
			return JudwaaResponse.build(null, HttpStatus.NOT_FOUND.getReasonPhrase(), HttpStatus.NOT_FOUND);
		}
		permissionRepository.deleteById(id);
		return JudwaaResponse.build(null, "Permission deleted", HttpStatus.OK);
	}
}
