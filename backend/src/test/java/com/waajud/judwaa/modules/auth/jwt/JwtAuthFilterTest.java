package com.waajud.judwaa.modules.auth.jwt;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.waajud.judwaa.modules.auth.service.TokenBlacklistService;
import java.io.IOException;
import java.lang.reflect.Field;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;

@ExtendWith(MockitoExtension.class)
class JwtAuthFilterTest {

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    private JwtAuthFilter filter;

    @BeforeEach
    void setUp() throws Exception {
        filter = new JwtAuthFilter();
        setField(filter, "userDetailsService", userDetailsService);
        setField(filter, "tokenBlacklistService", tokenBlacklistService);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilter_withoutAuthorizationHeader_keepsContextEmpty() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> {});

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilter_blacklistedToken_skipsAuthentication() throws Exception {
        String token = JwtUtil.generateToken("alice", Set.of("USER"));
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(tokenBlacklistService.isBlacklisted(token)).thenReturn(true);

        filter.doFilter(request, response, (req, res) -> {});

        verify(tokenBlacklistService).isBlacklisted(token);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilter_validToken_setsAuthentication() throws Exception {
        String token = JwtUtil.generateToken("bob", Set.of("USER"));
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(tokenBlacklistService.isBlacklisted(token)).thenReturn(false);
        when(userDetailsService.loadUserByUsername("bob")).thenReturn(
                User.withUsername("bob").password("pwd").authorities("USER").build());

        filter.doFilter(request, response, (req, res) -> {});

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilter_invalidToken_doesNotAuthenticate() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer invalid.token.value");
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(tokenBlacklistService.isBlacklisted("invalid.token.value")).thenReturn(false);

        filter.doFilter(request, response, (req, res) -> {});

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilter_withNonBearerHeader_skipsJwtProcessing() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Basic abc");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> {});

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilter_whenAlreadyAuthenticated_doesNotReloadUser() throws Exception {
        String token = JwtUtil.generateToken("carol", Set.of("USER"));
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(tokenBlacklistService.isBlacklisted(token)).thenReturn(false);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("existing", "pwd", java.util.List.of()));

        filter.doFilter(request, response, (req, res) -> {});

        org.mockito.Mockito.verifyNoInteractions(userDetailsService);
    }

    private static void setField(Object target, String name, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(name);
        field.setAccessible(true);
        field.set(target, value);
    }
}
