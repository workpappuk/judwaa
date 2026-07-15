package com.waajud.judwaa.modules.auth.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.waajud.judwaa.modules.auth.dto.request.RoleRequestDTO;
import com.waajud.judwaa.modules.auth.entity.Permission;
import com.waajud.judwaa.modules.auth.entity.Role;
import com.waajud.judwaa.modules.auth.repository.PermissionRepository;
import com.waajud.judwaa.modules.auth.repository.RoleRepository;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class RoleControllerTest {

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PermissionRepository permissionRepository;

    private RoleController controller;

    @BeforeEach
    void setUp() {
        controller = new RoleController();
        ReflectionTestUtils.setField(controller, "roleRepository", roleRepository);
        ReflectionTestUtils.setField(controller, "permissionRepository", permissionRepository);
    }

    @Test
    void roleController_paths() {
        UUID permissionId = UUID.randomUUID();
        Permission permission = new Permission();
        permission.setId(permissionId);

        Role role = new Role();
        role.setId(UUID.randomUUID());
        role.setName("ADMIN");

        when(roleRepository.findAll()).thenReturn(List.of(role));
        assertEquals(HttpStatus.OK, controller.getAll().getStatus());

        UUID id = role.getId();
        when(roleRepository.findById(id)).thenReturn(Optional.of(role));
        assertEquals(HttpStatus.OK, controller.get(id).getStatus());

        UUID missing = UUID.randomUUID();
        when(roleRepository.findById(missing)).thenReturn(Optional.empty());
        assertEquals(HttpStatus.NOT_FOUND, controller.get(missing).getStatus());

        RoleRequestDTO dto = new RoleRequestDTO();
        dto.setName("USER");
        dto.setPermissionIds(Set.of(permissionId));
        when(permissionRepository.findAllById(dto.getPermissionIds())).thenReturn(List.of(permission));
        when(roleRepository.save(any(Role.class))).thenAnswer(invocation -> {
            Role saved = invocation.getArgument(0);
            if (saved.getId() == null) {
                saved.setId(UUID.randomUUID());
            }
            return saved;
        });

        assertEquals(HttpStatus.CREATED, controller.create(dto).getStatus());

        when(roleRepository.findById(id)).thenReturn(Optional.of(role));
        assertEquals(HttpStatus.OK, controller.update(id, dto).getStatus());
        assertEquals(HttpStatus.NOT_FOUND, controller.update(missing, dto).getStatus());

        when(roleRepository.existsById(id)).thenReturn(true);
        assertEquals(HttpStatus.OK, controller.delete(id).getStatus());
        when(roleRepository.existsById(missing)).thenReturn(false);
        assertEquals(HttpStatus.NOT_FOUND, controller.delete(missing).getStatus());
    }

    @Test
    void createAndUpdate_withoutPermissionIds() {
        Role role = new Role();
        UUID id = UUID.randomUUID();
        role.setId(id);
        role.setName("USER");

        RoleRequestDTO dto = new RoleRequestDTO();
        dto.setName("USER");
        dto.setPermissionIds(null);

        when(roleRepository.save(any(Role.class))).thenAnswer(invocation -> {
            Role saved = invocation.getArgument(0);
            if (saved.getId() == null) {
                saved.setId(UUID.randomUUID());
            }
            return saved;
        });
        when(roleRepository.findById(id)).thenReturn(Optional.of(role));

        assertEquals(HttpStatus.CREATED, controller.create(dto).getStatus());
        assertEquals(HttpStatus.OK, controller.update(id, dto).getStatus());
        verify(permissionRepository, org.mockito.Mockito.never()).findAllById(any());
    }
}
