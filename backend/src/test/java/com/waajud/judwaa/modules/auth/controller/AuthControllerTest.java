package com.waajud.judwaa.modules.auth.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.waajud.judwaa.modules.auth.dto.request.AuthRequestDTO;
import com.waajud.judwaa.modules.auth.dto.request.ForceLogoutRequestDTO;
import com.waajud.judwaa.modules.auth.dto.request.RegisterRequestDTO;
import com.waajud.judwaa.modules.auth.dto.response.AuthResponseDTO;
import com.waajud.judwaa.modules.auth.entity.User;
import com.waajud.judwaa.modules.auth.service.TokenBlacklistService;
import com.waajud.judwaa.modules.auth.service.UserService;
import com.waajud.judwaa.shared.JudwaaResponse;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    private AuthController controller;

    @BeforeEach
    void setUp() {
        controller = new AuthController();
        ReflectionTestUtils.setField(controller, "authenticationManager", authenticationManager);
        ReflectionTestUtils.setField(controller, "userService", userService);
        ReflectionTestUtils.setField(controller, "passwordEncoder", passwordEncoder);
        ReflectionTestUtils.setField(controller, "tokenBlacklistService", tokenBlacklistService);
    }

    @Test
    void login_returnsToken() {
        AuthRequestDTO request = new AuthRequestDTO("john", "pwd");
        UserDetails principal = org.springframework.security.core.userdetails.User
                .withUsername("john").password("pwd").authorities("ADMIN", "USER").build();
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);

        JudwaaResponse<AuthResponseDTO, String> response = controller.login(request);

        assertEquals(HttpStatus.OK, response.getStatus());
        assertEquals(true, response.getData().getToken() != null && !response.getData().getToken().isBlank());
    }

    @Test
    void register_existingUsername_returnsBadRequest() {
        RegisterRequestDTO request = new RegisterRequestDTO("john", "pwd");
        when(userService.existsByUsername("john")).thenReturn(true);

        JudwaaResponse<Object, String> response = controller.register(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatus());
        assertEquals("Username already exists", response.getMessage());
    }

    @Test
    void register_newUser_returnsOk() {
        RegisterRequestDTO request = new RegisterRequestDTO("john", "pwd");
        when(userService.existsByUsername("john")).thenReturn(false);
        when(passwordEncoder.encode("pwd")).thenReturn("enc");

        JudwaaResponse<Object, String> response = controller.register(request);

        assertEquals(HttpStatus.OK, response.getStatus());
        verify(userService).save(any(User.class));
    }

    @Test
    void logout_missingBearer_returnsBadRequest() {
        JudwaaResponse<Object, String> response = controller.logout(null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatus());
    }

    @Test
    void logout_invalidBearer_returnsBadRequest() {
        JudwaaResponse<Object, String> response = controller.logout("Token abc");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatus());
    }

    @Test
    void logout_blacklistFailure_returnsBadRequest() {
        org.mockito.Mockito.doThrow(new RuntimeException("bad")).when(tokenBlacklistService).blacklistToken("abc");

        JudwaaResponse<Object, String> response = controller.logout("Bearer abc");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatus());
    }

    @Test
    void logout_success_returnsOk() {
        JudwaaResponse<Object, String> response = controller.logout("Bearer abc");

        assertEquals(HttpStatus.OK, response.getStatus());
        verify(tokenBlacklistService).blacklistToken("abc");
    }

    @Test
    void forceLogout_notAdmin_returnsForbidden() {
        Authentication authentication = new UsernamePasswordAuthenticationToken("user", "pwd",
                List.of(new SimpleGrantedAuthority("USER")));

        JudwaaResponse<Object, String> response = controller.forceLogout(new ForceLogoutRequestDTO("abc"), authentication);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatus());
    }

    @Test
    void forceLogout_adminMissingToken_returnsBadRequest() {
        Authentication authentication = new UsernamePasswordAuthenticationToken("admin", "pwd",
                List.of(new SimpleGrantedAuthority("ADMIN")));

        JudwaaResponse<Object, String> response = controller.forceLogout(new ForceLogoutRequestDTO("   "), authentication);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatus());
    }

    @Test
    void forceLogout_adminInvalidToken_returnsBadRequest() {
        Authentication authentication = new UsernamePasswordAuthenticationToken("admin", "pwd",
                List.of(new SimpleGrantedAuthority("ADMIN")));
        org.mockito.Mockito.doThrow(new RuntimeException("bad")).when(tokenBlacklistService).blacklistToken(eq("abc"));

        JudwaaResponse<Object, String> response = controller.forceLogout(new ForceLogoutRequestDTO("Bearer abc"), authentication);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatus());
    }

    @Test
    void forceLogout_adminSuccess_returnsOk() {
        Authentication authentication = new UsernamePasswordAuthenticationToken("admin", "pwd",
                List.of(new SimpleGrantedAuthority("ADMIN")));

        JudwaaResponse<Object, String> response = controller.forceLogout(new ForceLogoutRequestDTO("Bearer abc"), authentication);

        assertEquals(HttpStatus.OK, response.getStatus());
        verify(tokenBlacklistService).blacklistToken("abc");
    }

    @Test
    void forceLogout_nullAuthentication_returnsForbidden() {
        JudwaaResponse<Object, String> response = controller.forceLogout(new ForceLogoutRequestDTO("abc"), null);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatus());
    }
}
