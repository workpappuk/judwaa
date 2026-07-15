package com.waajud.judwaa.modules.auth.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.waajud.judwaa.modules.auth.entity.Role;
import com.waajud.judwaa.modules.auth.entity.User;
import com.waajud.judwaa.modules.auth.repository.UserRepository;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl service;

    @Test
    void loadUserByUsername_notFound_throws() {
        when(userRepository.findByUsername("missing")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> service.loadUserByUsername("missing"));
    }

    @Test
    void loadUserByUsername_withRoles_mapsAuthorities() {
        Role role = new Role();
        role.setName("ADMIN");
        User user = new User();
        user.setUsername("john");
        user.setPassword("pwd");
        user.setRoles(Set.of(role));
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));

        UserDetails details = service.loadUserByUsername("john");

        assertEquals("john", details.getUsername());
        assertEquals(1, details.getAuthorities().size());
    }

    @Test
    void loadUserByUsername_withoutRoles_usesEmptyAuthorities() {
        User user = new User();
        user.setUsername("jane");
        user.setPassword("pwd");
        user.setRoles(null);
        when(userRepository.findByUsername("jane")).thenReturn(Optional.of(user));

        UserDetails details = service.loadUserByUsername("jane");

        assertEquals(0, details.getAuthorities().size());
    }
}
