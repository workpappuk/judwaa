package com.waajud.judwaa.modules.auth.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.waajud.judwaa.modules.auth.dto.request.UserRequestDTO;
import com.waajud.judwaa.modules.auth.dto.response.UserResponseDTO;
import com.waajud.judwaa.modules.auth.entity.Role;
import com.waajud.judwaa.modules.auth.entity.User;
import com.waajud.judwaa.modules.auth.repository.RoleRepository;
import com.waajud.judwaa.modules.auth.repository.UserRepository;
import com.waajud.judwaa.shared.JudwaaResponse;
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
class UserControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    private UserController controller;

    @BeforeEach
    void setUp() {
        controller = new UserController();
        ReflectionTestUtils.setField(controller, "userRepository", userRepository);
        ReflectionTestUtils.setField(controller, "roleRepository", roleRepository);
    }

    @Test
    void getAll_returnsUsers() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername("u");
        when(userRepository.findAll()).thenReturn(List.of(user));

        JudwaaResponse<List<UserResponseDTO>, String> response = controller.getAll();

        assertEquals(HttpStatus.OK, response.getStatus());
        assertEquals(1, response.getData().size());
    }

    @Test
    void get_foundAndNotFound() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setId(id);
        user.setUsername("u");
        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        assertEquals(HttpStatus.OK, controller.get(id).getStatus());

        UUID missing = UUID.randomUUID();
        when(userRepository.findById(missing)).thenReturn(Optional.empty());
        assertEquals(HttpStatus.NOT_FOUND, controller.get(missing).getStatus());
    }

    @Test
    void create_update_delete_paths() {
        UUID roleId = UUID.randomUUID();
        Role role = new Role();
        role.setId(roleId);
        UserRequestDTO dto = new UserRequestDTO();
        dto.setUsername("u");
        dto.setPassword("p");
        dto.setRoleIds(Set.of(roleId));

        when(roleRepository.findAllById(dto.getRoleIds())).thenReturn(List.of(role));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        JudwaaResponse<UserResponseDTO, String> createResponse = controller.create(dto);
        assertEquals(HttpStatus.CREATED, createResponse.getStatus());
        assertNotNull(createResponse.getData());

        UUID id = UUID.randomUUID();
        User existing = new User();
        existing.setId(id);
        existing.setUsername("old");
        when(userRepository.findById(id)).thenReturn(Optional.of(existing));
        JudwaaResponse<UserResponseDTO, String> updateOk = controller.update(id, dto);
        assertEquals(HttpStatus.OK, updateOk.getStatus());

        UUID missing = UUID.randomUUID();
        when(userRepository.findById(missing)).thenReturn(Optional.empty());
        assertEquals(HttpStatus.NOT_FOUND, controller.update(missing, dto).getStatus());

        when(userRepository.existsById(id)).thenReturn(true);
        assertEquals(HttpStatus.OK, controller.delete(id).getStatus());
        when(userRepository.existsById(missing)).thenReturn(false);
        assertEquals(HttpStatus.NOT_FOUND, controller.delete(missing).getStatus());
    }

    @Test
    void createAndUpdate_withoutRoleIds() {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setUsername("u2");
        dto.setPassword("p2");
        dto.setRoleIds(null);

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        assertEquals(HttpStatus.CREATED, controller.create(dto).getStatus());

        UUID id = UUID.randomUUID();
        User existing = new User();
        existing.setId(id);
        when(userRepository.findById(id)).thenReturn(Optional.of(existing));
        assertEquals(HttpStatus.OK, controller.update(id, dto).getStatus());
    }
}
