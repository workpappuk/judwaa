package com.waajud.judwaa.modules.auth;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.waajud.judwaa.modules.auth.entity.Permission;
import com.waajud.judwaa.modules.auth.entity.Role;
import com.waajud.judwaa.modules.auth.repository.PermissionRepository;
import com.waajud.judwaa.modules.auth.repository.RoleRepository;
import com.waajud.judwaa.modules.auth.repository.UserRepository;
import com.waajud.judwaa.modules.auth.service.UserService;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthModuleSetupTest {

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PermissionRepository permissionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    void seedAuth_createsAdminWhenMissing() throws Exception {
        AuthModuleSetup setup = new AuthModuleSetup();

        when(permissionRepository.existsByName(any(String.class))).thenReturn(false);
        when(permissionRepository.findByName(any(String.class))).thenReturn(Optional.of(new Permission("P")));
        when(roleRepository.existsByName(any(String.class))).thenReturn(false);
        Role adminRole = new Role();
        adminRole.setName("ADMIN");
        when(roleRepository.findByName("ADMIN")).thenReturn(Optional.of(adminRole));
        when(userService.existsByUsername("admin")).thenReturn(false);
        when(passwordEncoder.encode("admin")).thenReturn("enc");

        CommandLineRunner runner = setup.seedAuth(userService, userRepository, roleRepository, permissionRepository, passwordEncoder);
        runner.run();

        verify(userRepository).deleteAll();
        verify(roleRepository).deleteAll();
        verify(permissionRepository).deleteAll();
        verify(userService).save(any());
    }

    @Test
    void seedAuth_skipsAdminCreationWhenExists() throws Exception {
        AuthModuleSetup setup = new AuthModuleSetup();

        when(permissionRepository.existsByName(any(String.class))).thenReturn(true);
        when(roleRepository.existsByName(any(String.class))).thenReturn(true);
        when(userService.existsByUsername("admin")).thenReturn(true);

        CommandLineRunner runner = setup.seedAuth(userService, userRepository, roleRepository, permissionRepository, passwordEncoder);
        runner.run();

        verify(userService).existsByUsername("admin");
        org.mockito.Mockito.verify(userService, org.mockito.Mockito.never()).save(any());
    }
}
