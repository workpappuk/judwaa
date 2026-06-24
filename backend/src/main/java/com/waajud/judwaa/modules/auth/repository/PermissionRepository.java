package com.waajud.judwaa.modules.auth.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

import com.waajud.judwaa.modules.auth.entity.*;

public interface PermissionRepository extends JpaRepository<Permission, UUID> {
	Optional<Permission> findByName(String name);

	boolean existsByName(String name);
}
