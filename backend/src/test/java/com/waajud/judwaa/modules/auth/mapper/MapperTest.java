package com.waajud.judwaa.modules.auth.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.waajud.judwaa.modules.auth.dto.request.PermissionRequestDTO;
import com.waajud.judwaa.modules.auth.dto.request.RoleRequestDTO;
import com.waajud.judwaa.modules.auth.dto.request.UserRequestDTO;
import com.waajud.judwaa.modules.auth.entity.Permission;
import com.waajud.judwaa.modules.auth.entity.Role;
import com.waajud.judwaa.modules.auth.entity.User;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class MapperTest {

    @Test
    void permissionMapper_coversNullAndUpdateBranches() {
        assertNull(PermissionMapper.toResponseDTO(null));
        assertNull(PermissionMapper.toEntity(null));

        PermissionRequestDTO dto = new PermissionRequestDTO();
        dto.setName("READ");
        Permission permission = PermissionMapper.toEntity(dto);
        assertEquals("READ", permission.getName());

        PermissionRequestDTO empty = new PermissionRequestDTO();
        PermissionMapper.updateEntity(permission, empty);
        assertEquals("READ", permission.getName());

        PermissionRequestDTO update = new PermissionRequestDTO();
        update.setName("WRITE");
        PermissionMapper.updateEntity(permission, update);
        assertEquals("WRITE", permission.getName());

        permission.setId(UUID.randomUUID());
        assertNotNull(PermissionMapper.toResponseDTO(permission));
    }

    @Test
    void roleMapper_coversNullAndUpdateBranches() {
        assertNull(RoleMapper.toResponseDTO(null));
        assertNull(RoleMapper.toEntity(null, null));

        Permission permission = new Permission();
        permission.setId(UUID.randomUUID());

        RoleRequestDTO dto = new RoleRequestDTO();
        dto.setName("ADMIN");
        Role role = RoleMapper.toEntity(dto, Set.of(permission));
        assertEquals("ADMIN", role.getName());

        RoleRequestDTO empty = new RoleRequestDTO();
        RoleMapper.updateEntity(role, empty, null);
        assertEquals("ADMIN", role.getName());

        RoleRequestDTO update = new RoleRequestDTO();
        update.setName("USER");
        RoleMapper.updateEntity(role, update, Set.of(permission));
        assertEquals("USER", role.getName());

        role.setId(UUID.randomUUID());
        assertNotNull(RoleMapper.toResponseDTO(role));
    }

    @Test
    void userMapper_coversNullAndUpdateBranches() {
        assertNull(UserMapper.toResponseDTO(null));
        assertNull(UserMapper.toEntity(null, null));

        Role role = new Role();
        role.setId(UUID.randomUUID());

        UserRequestDTO dto = new UserRequestDTO();
        dto.setUsername("u");
        dto.setPassword("p");
        User user = UserMapper.toEntity(dto, Set.of(role));
        assertEquals("u", user.getUsername());

        UserRequestDTO empty = new UserRequestDTO();
        UserMapper.updateEntity(user, empty, null);
        assertEquals("u", user.getUsername());

        UserRequestDTO update = new UserRequestDTO();
        update.setUsername("u2");
        update.setPassword("p2");
        UserMapper.updateEntity(user, update, Set.of(role));
        assertEquals("u2", user.getUsername());
        assertEquals("p2", user.getPassword());

        user.setId(UUID.randomUUID());
        assertNotNull(UserMapper.toResponseDTO(user));
    }
}
