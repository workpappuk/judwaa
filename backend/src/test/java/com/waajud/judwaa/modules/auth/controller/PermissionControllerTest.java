package com.waajud.judwaa.modules.auth.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.waajud.judwaa.modules.auth.dto.request.PermissionRequestDTO;
import com.waajud.judwaa.modules.auth.entity.Permission;
import com.waajud.judwaa.modules.auth.repository.PermissionRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class PermissionControllerTest {

    @Mock
    private PermissionRepository permissionRepository;

    private PermissionController controller;

    @BeforeEach
    void setUp() {
        controller = new PermissionController();
        ReflectionTestUtils.setField(controller, "permissionRepository", permissionRepository);
    }

    @Test
    void permissionController_paths() {
        Permission permission = new Permission();
        UUID id = UUID.randomUUID();
        permission.setId(id);
        permission.setName("READ");

        when(permissionRepository.findAll()).thenReturn(List.of(permission));
        assertEquals(HttpStatus.OK, controller.getAll().getStatus());

        when(permissionRepository.findById(id)).thenReturn(Optional.of(permission));
        assertEquals(HttpStatus.OK, controller.get(id).getStatus());

        UUID missing = UUID.randomUUID();
        when(permissionRepository.findById(missing)).thenReturn(Optional.empty());
        assertEquals(HttpStatus.NOT_FOUND, controller.get(missing).getStatus());

        PermissionRequestDTO dto = new PermissionRequestDTO();
        dto.setName("WRITE");
        when(permissionRepository.save(any(Permission.class))).thenAnswer(invocation -> {
            Permission saved = invocation.getArgument(0);
            if (saved.getId() == null) {
                saved.setId(UUID.randomUUID());
            }
            return saved;
        });

        assertEquals(HttpStatus.CREATED, controller.create(dto).getStatus());

        when(permissionRepository.findById(id)).thenReturn(Optional.of(permission));
        assertEquals(HttpStatus.OK, controller.update(id, dto).getStatus());
        assertEquals(HttpStatus.NOT_FOUND, controller.update(missing, dto).getStatus());

        when(permissionRepository.existsById(id)).thenReturn(true);
        assertEquals(HttpStatus.OK, controller.delete(id).getStatus());
        when(permissionRepository.existsById(missing)).thenReturn(false);
        assertEquals(HttpStatus.NOT_FOUND, controller.delete(missing).getStatus());
    }
}
