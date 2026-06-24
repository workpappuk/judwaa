package com.waajud.judwaa.modules.auth.repository;

import com.waajud.judwaa.modules.auth.entity.*;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, UUID> {
	Optional<Role> findByName(String name);

	boolean existsByName(String name);
}
